/**
 * Tests du Store Mobile (Zustand + AsyncStorage)
 * 
 * Ces tests vérifient la logique d'état sans dépendre de Jest
 * Compatible avec Expo SDK 54
 */

import { useStore } from '../lib/store';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`  Expected:`, expected);
    console.error(`  Actual:`, actual);
    testsFailed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  }
}

// Tests
export async function runStoreTests() {
  console.log('\n🧪 Running Mobile Store Tests...\n');

  try {
    // Test 1: Initial state
    const initialState = useStore.getState();
    assert(initialState.user === null, 'Initial user should be null');
    assert(initialState.token === null, 'Initial token should be null');
    assertEqual(initialState.notes, [], 'Initial notes should be empty');
    assert(initialState.isOffline === false, 'Initial offline should be false');

    // Test 2: Set offline
    useStore.getState().setOffline(true);
    assert(useStore.getState().isOffline === true, 'setOffline(true) works');
    
    useStore.getState().setOffline(false);
    assert(useStore.getState().isOffline === false, 'setOffline(false) works');

    // Test 3: Set loading
    useStore.getState().setLoading(true);
    assert(useStore.getState().isLoading === true, 'setLoading(true) works');
    
    useStore.getState().setLoading(false);
    assert(useStore.getState().isLoading === false, 'setLoading(false) works');

    // Test 4: Notes management
    const mockNote = {
      id: 'test-1',
      title: 'Test Note',
      contentMd: 'Test content',
      tags: ['test'],
      visibility: 'PRIVATE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'user-1',
    };

    useStore.getState().addNote(mockNote);
    assert(useStore.getState().notes.length === 1, 'addNote() adds a note');
    assert(useStore.getState().notes[0].id === 'test-1', 'addNote() adds correct note');

    // Test 5: Update note
    const updatedNote = { ...mockNote, title: 'Updated Title' };
    useStore.getState().updateNote(updatedNote);
    assert(useStore.getState().notes[0].title === 'Updated Title', 'updateNote() updates the note');

    // Test 6: Delete note
    useStore.getState().deleteNote('test-1');
    assertEqual(useStore.getState().notes, [], 'deleteNote() removes the note');

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`  ✅ Passed: ${testsPassed}`);
    console.log(`  ❌ Failed: ${testsFailed}`);
    console.log(`  📈 Success rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%\n`);

    return testsPassed === testsPassed + testsFailed;
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    return false;
  }
}

// Export pour utilisation dans l'app
export const storeTestResults = {
  run: runStoreTests,
  passed: () => testsPassed,
  failed: () => testsFailed,
};
