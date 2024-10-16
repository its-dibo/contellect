import type { Config } from 'tailwindcss';
import { createGlobPatternsForDependencies } from '@nx/angular/tailwind';
import typography from '@tailwindcss/typography';

export default {
  content: [
    'src/**/!(*.stories|*.spec).{ts,html}',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'indigo',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
