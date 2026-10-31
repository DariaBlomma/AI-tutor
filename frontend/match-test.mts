import { exactPathTest } from '@tanstack/router-core';

// Так матчер TanStack Router проверяет совпадение шаблона пути с pathname.
const cases: Array<[string, string]> = [
  ['/tasks-bank/$publicId', '/tasks-bank/TSK-1'],
  ['/tasks-bank/$publicId', '/tasks-bank/TSK-1/edit'],
  ['/tasks-bank/$publicId/edit', '/tasks-bank/TSK-1/edit'],
];
for (const [tpl, path] of cases) {
  console.log(tpl, 'vs', path, '=>', exactPathTest(tpl, path));
}
