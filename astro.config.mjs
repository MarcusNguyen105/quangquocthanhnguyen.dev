import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://quangquocthanhnguyen.dev',
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
            { label: 'Welcome & System Map', slug: 'index' },
          ],
        },
        {
          label: 'Software Architecture',
          autogenerate: { directory: 'architecture' },
          collapsed: false,
        },
        {
          label: 'Cloud & DevOps',
          autogenerate: { directory: 'cloud-devops' },
          collapsed: false,
        },
        {
          label: 'AI & Machine Learning',
          autogenerate: { directory: 'ai-ml' },
          collapsed: false,
        },
        {
          label: 'Cybersecurity',
          autogenerate: { directory: 'security' },
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
