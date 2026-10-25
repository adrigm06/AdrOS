import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { EMBEDDING_DIMENSIONS } from '../supabase/functions/_shared/embedding.ts';

interface Schema { table?: number; rpc?: number }

// Interpret relevant declarations in order, checking table and RPC independently.
// This is a source contract check, not a substitute for applying SQL to Postgres.
function effectiveSchema(migrations: string[]): Schema {
  const schema: Schema = {};
  for (const migration of migrations) {
    const sql = migration.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const declarations = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?documents\s*\([\s\S]*?embedding\s+vector\((\d+)\)|alter\s+table\s+(?:public\.)?documents\s+alter\s+(?:column\s+)?embedding\s+(?:set\s+data\s+)?type\s+vector\((\d+)\)|create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?match_documents\s*\(\s*query_embedding\s+vector\((\d+)\)|drop\s+function\s+(?:if\s+exists\s+)?(?:public\.)?match_documents\s*\(/gi;
    for (const match of sql.matchAll(declarations)) {
      if (match[1] !== undefined || match[2] !== undefined) schema.table = Number(match[1] ?? match[2]);
      else if (match[3] !== undefined) schema.rpc = Number(match[3]);
      else delete schema.rpc;
    }
    const unhandled = sql.replace(declarations, '');
    if (/\b(?:create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?match_documents\b|create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?documents\b|alter\s+table\s+(?:public\.)?documents\b[^;]*\bembedding\b|drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?documents\b)/i.test(unhandled)) {
      throw new Error('Unsupported embedding schema change: extend the contract reader instead of silently ignoring it');
    }
  }
  return schema;
}

function assertSchema(schema: Schema, dimension: number) {
  if (schema.table !== dimension || schema.rpc !== dimension) {
    throw new Error(`Embedding dimension mismatch: code=${dimension}, documents=${schema.table}, match_documents=${schema.rpc}`);
  }
}

function producerDimension(relative: string): number {
  const text = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const source = ts.createSourceFile(relative, text, ts.ScriptTarget.Latest, true);
  let sharedBinding = false;
  const dimensions: number[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && /(?:^|\/)embedding\.ts$/.test(node.moduleSpecifier.text)) {
      const bindings = node.importClause?.namedBindings;
      sharedBinding = !!bindings && ts.isNamedImports(bindings) && bindings.elements.some((item) =>
        item.name.text === 'EMBEDDING_DIMENSIONS' && !item.propertyName,
      );
    }
    if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'outputDimensionality') {
      if (ts.isIdentifier(node.initializer) && node.initializer.text === 'EMBEDDING_DIMENSIONS') dimensions.push(EMBEDDING_DIMENSIONS);
      else if (ts.isNumericLiteral(node.initializer)) dimensions.push(Number(node.initializer.text));
      else throw new Error(`Unsupported embedding dimension expression in ${relative}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  expect(sharedBinding).toBe(true);
  expect(dimensions).toHaveLength(1);
  return dimensions[0];
}

const directory = new URL('../supabase/migrations/', import.meta.url);
const historical = readFileSync(new URL('20260628_rag_chatbot.sql', directory), 'utf8');

describe('embedding schema consistency', () => {
  it('reproduces the historical 768 code versus 384 SQL defect', () => {
    expect(effectiveSchema([historical])).toEqual({ table: 384, rpc: 384 });
    expect(() => assertSchema(effectiveSchema([historical]), 768)).toThrow('code=768, documents=384, match_documents=384');
  });

  it('does not hide a partial fix to only the table or the RPC', () => {
    for (const correction of [
      'alter table documents alter column embedding type vector(768);',
      'create or replace function match_documents(query_embedding vector(768), match_threshold float, match_count int)',
    ]) expect(() => assertSchema(effectiveSchema([historical, correction]), 768)).toThrow();
  });

  it('fails closed for relevant schema changes the source-contract reader cannot interpret', () => {
    expect(() => effectiveSchema([historical, 'alter table documents alter column embedding type vector;'])).toThrow('Unsupported');
    expect(() => effectiveSchema([historical, 'create or replace function match_documents(query_embedding vector) returns void;'])).toThrow('Unsupported');
  });

  it('keeps the corrective migration transactional and rejects incompatible stored vectors before changing schema', () => {
    const correction = readFileSync(new URL('20261025085907_embedding_dimensions_768.sql', directory), 'utf8');
    expect(correction).toMatch(/begin;[\s\S]*commit;/i);
    expect(correction).toMatch(/embedding is not null and vector_dims\(embedding\) <> 768/i);
    expect(correction.indexOf('lock table')).toBeLessThan(correction.indexOf('if exists'));
    expect(correction.indexOf('raise exception')).toBeLessThan(correction.indexOf('alter table'));
    expect(correction).not.toMatch(/\b(delete\s+from|truncate\s+(?:table\s+)?documents|update\s+documents)\b/i);
  });

  it('matches both active code producers against the effective table and RPC schema', () => {
    const ingestion = producerDimension('../scripts/ingest.ts');
    const chat = producerDimension('../supabase/functions/chat/index.ts');
    expect(chat).toBe(ingestion);
    const migrations = readdirSync(directory).filter((name) => name.endsWith('.sql')).sort().map((name) => readFileSync(new URL(name, directory), 'utf8'));
    assertSchema(effectiveSchema(migrations), ingestion);
  });
});
