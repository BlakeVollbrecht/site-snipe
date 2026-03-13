export default defineContentScript({
  matches: ['*://*.spellionaire.com/*'],
  main() {
    console.log('Hello content.');
  },
});
