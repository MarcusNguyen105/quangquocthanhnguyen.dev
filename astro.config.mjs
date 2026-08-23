import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://marcusnguyen105.github.io',
  base: '/quangquocthanhnguyen.dev',
  integrations: [
    starlight({
      title: 'Quang Quoc Thanh Nguyen',
      description: 'Engineering notes, system architecture, cloud infrastructure, AI systems, and technical references.',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/MarcusNguyen105',
        linkedin: 'https://linkedin.com/in/quangquocthanhnguyen',
        youtube: 'https://youtube.com',
      },
      customCss: [
        // Custom Neo-Tech obsidian theme & glassmorphism
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Welcome & Knowledge Hub', slug: 'index' },
          ],
        },
        {
          label: 'Portfolio & Case Studies',
          autogenerate: { directory: 'portfolio' },
          collapsed: false,
        },
        {
          label: 'Routing (CCNA / CCNP)',
          autogenerate: { directory: 'routing' },
          collapsed: false,
        },
        {
          label: 'Switching (L2 / L3)',
          autogenerate: { directory: 'switching' },
          collapsed: false,
        },
        {
          label: 'Network Services & Operations',
          autogenerate: { directory: 'services' },
          collapsed: true,
        },
        {
          label: 'Network Security & Hardening',
          autogenerate: { directory: 'security' },
          collapsed: true,
        },
        {
          label: 'Nexus Dashboard & Data Center',
          autogenerate: { directory: 'nexus-dashboard' },
          collapsed: true,
        },
        {
          label: 'Software Architecture',
          autogenerate: { directory: 'architecture' },
          collapsed: true,
        },
        {
          label: 'Cloud & DevOps',
          autogenerate: { directory: 'cloud-devops' },
          collapsed: true,
        },
        {
          label: 'AI & Machine Learning',
          autogenerate: { directory: 'ai-ml' },
          collapsed: true,
        },
        {
          label: 'Cheat Sheets & Runbooks',
          autogenerate: { directory: 'cheat-sheets' },
          collapsed: true,
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      editLink: {
        baseUrl: 'https://github.com/MarcusNguyen105/quangquocthanhnguyen.dev/edit/main/',
      },
      credits: false,
    }),
  ],
});
