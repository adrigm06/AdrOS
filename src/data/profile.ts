type Lang = 'es' | 'en';

interface ProfileData {
  name: string;
  role: string;
  location: string;
  bio: string;
  github: string;
  linkedin: string;
  email: string;
}

export const PROFILE: Record<Lang, ProfileData> = {
  es: {
    name: 'Adrián Gómez',
    role: 'Full Stack Developer | AI Engineer',
    location: '📍 Málaga, España',
    bio: 'AI Engineer y Full Stack Developer especializado en Java y Spring Boot, con experiencia en desarrollo backend y arquitecturas de microservicios en entornos FinTech.\n\nMi especialización está en AI Engineering, especialmente en la integración de LLMs, RAG, agentes y automatización de procesos de software.\n\nTambién trabajo con frontend y desarrollo móvil, lo que me permite participar en el desarrollo completo de una solución, desde la arquitectura y el backend hasta su integración con IA.',
    github: 'https://github.com/adrigm06',
    linkedin: 'https://www.linkedin.com/in/adrigml/',
    email: 'mailto:adriglc6@gmail.com',
  },
  en: {
    name: 'Adrián Gómez',
    role: 'Full Stack Developer | AI Engineer',
    location: '📍 Málaga, Spain',
    bio: 'AI Engineer and Full Stack Developer specialized in Java and Spring Boot, with experience in backend development and microservices architectures in FinTech environments.\n\nMy specialization focuses on AI Engineering, particularly LLM integration, RAG systems, autonomous agents, and software process automation.\n\nI also work across frontend and mobile engineering, allowing me to take full ownership of digital solutions—from architecture and backend systems to cutting-edge AI integration.',
    github: 'https://github.com/adrigm06',
    linkedin: 'https://www.linkedin.com/in/adrigml/',
    email: 'mailto:adriglc6@gmail.com',
  },
};

