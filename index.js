#!/usr/bin/env node

import('inquirer').then(async (inquirerModule) => {
  const inquirer = inquirerModule.default;
const csv = require('csv-parser');
const fs = require('fs-extra');
const matter = require('gray-matter');

async function run() {
  const { csvPath, destination } = await inquirer.prompt([
    {
      type: 'input',
      name: 'csvPath',
      message: 'Enter the path to the CSV file:',
      validate: async (value) => {
        if (!value.length) {
          return 'A valid file path is required.';
        }
        try {
          await fs.access(value);
          return true;
        } catch {
          return 'File not found at given path.';
        }
      },
    },
    {
      type: 'input',
      name: 'destination',
      message: 'Enter the destination folder:',
      validate: (value) => !!value.length || 'A valid folder name is required.',
    },
  ]);

  const rows = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', () => {
      rows.forEach((row, idx) => {
        const slug = row.slug;
        const fileName = `${destination}/${slug || idx + 1}.mdx`;

        if (row.slug) {
          delete row.slug; // This removes the slug field from the row
        }
        
        const content = matter.stringify('', row);
        fs.outputFile(fileName, content);
      });
      console.log('MDX files have been successfully generated!');
    });
}

run();
});
