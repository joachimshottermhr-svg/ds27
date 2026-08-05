/**
 * Run every audit and report a single verdict.
 *
 * Exit codes are the point. An audit that always exits 0 is a log statement, and a
 * runner that swallows a child's exit code turns five audits into five log statements.
 * Each child's status is checked and the worst one is returned.
 *
 *   node tools/audit.mjs
 */
import { spawnSync } from 'node:child_process';

const AUDITS = [
  ['ascii', 'tools/audit-ascii.mjs'],
  ['raw-literals', 'tools/audit-raw-literals.mjs'],
  ['shared-state', 'tools/audit-shared-state.mjs'],
  ['duplicate-rules', 'tools/audit-duplicate-rules.mjs'],
  ['nested-interactive', 'tools/audit-nested-interactive.mjs'],
];

const failed = [];
for (const [name, script] of AUDITS) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (r.status !== 0) failed.push(name);
}

console.log('\n' + '='.repeat(60));
if (!failed.length) {
  console.log(`all ${AUDITS.length} audits clean`);
  process.exit(0);
}
console.error(`${failed.length} of ${AUDITS.length} audits failing: ${failed.join(', ')}`);
process.exit(1);
