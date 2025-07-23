import { useEffect, useState, useRef } from 'react';
import letterData from '../assets/letter_data.json';

/**
 * Checks if 'subseq' is a subsequence of 'word' (letters in order, contiguous).
 * @param word - The word to check within.
 * @param subseq - The subsequence to look for.
 * @returns True if 'subseq' is a subsequence of 'word'.
 */
const isSubsequence = (word: string, subseq: string): boolean => {
  // If the subsequence is empty, then it is a subsequence of any word.
  if (!subseq) return true; 
  // If the entire subsequence is in the word, then it is a subsequence. HAS TO BE CONTIGUOUS.
  return word.includes(subseq);
};

/**
 * Determines if a candidate word can be formed using the rack and the word (word letters must be in order).
 * @param candidate - The candidate word to check.
 * @param rack - The available rack letters (any order, any subset).
 * @param word - The word whose letters must appear in order in the candidate.
 * @returns True if the candidate can be formed.
 */
const canForm = (candidate: string, rack: string, word: string): boolean => {
  // First, check if the candidate is between 2 and 15 letters.
  if (candidate.length < 2 || candidate.length > 15) return false;

  const candidateArr: string[] = candidate.split('');
  // Second, check if the candidate is a subsequence of the word. If it is, then we can remove the letters from the candidate.
  if (isSubsequence(candidate, word)) {
    const wordArr: string[] = word.split('');
    for (const l of wordArr) {
      const idx: number = candidateArr.indexOf(l);
      if (idx === -1) return false;
      candidateArr.splice(idx, 1);
    }
  }

  // Check to see if the rack can be used the form the remaining letters of the candidate.
  const rackArr: string[] = rack.split('');
  for (const l of candidateArr) {
    const idx: number = rackArr.indexOf(l);
    if (idx === -1) return false;
    rackArr.splice(idx, 1);
  }
  // If the candidate is now empty BUT the rack is the same length as before, then the rack was not used
  // So this is not a valid word.
  if (rackArr.length === rack.length) return false;

  // If we were able to complete the rest of candiate with the rack, then it's a valid scrabble word.
  return true;
};

/**
 * Calculates the total point value of a word using letterData.
 * @param word - The word to score.
 * @returns The total score for the word.
 */
const scoreWord = (word: string): number => {
  let score = 0;
  for (const l of word.toUpperCase()) {
    score += (letterData as Record<string, { tiles: number; score: number }>)[l]?.score || 0;
  }
  return score;
};

// Hook return type
export type UseFindWordResult = {
  bestWord: string | null;
  score: number;
  loading: boolean;
  error: string | null;
  clearFindWord: () => void;
};

/**
 * React hook to find the highest scoring valid word from the dictionary using a rack and an optional word.
 * - The rack letters can be used in any order and any subset.
 * - The word's letters must appear in order in the result.
 * - Returns the highest scoring valid word, loading, and error states.
 * @param rack - The available rack letters.
 * @param word - The word whose letters must appear in order (optional).
 * @returns An object with the bestWord, loading, and error states.
 */
const useFindWord = (rack: string, word: string = '', isPlaying: boolean): UseFindWordResult => {
  const [bestWord, setBestWord] = useState<string | null>(null);
  const [score, setScore] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const dictRef = useRef<string[] | null>(null);
  
  /**
   * Clears the best word, score, and error states.
   */
  const clearFindWord = () => {
    setLoading(false);
    setScore(-1);
    setError(null);
    setBestWord(null);
  }

  // Fetch dictionary and store it in a ref.
  useEffect(() => {
    if (dictRef.current) return; // Already loaded
    setLoading(true);
    fetch('/src/assets/dictionary.text')
      .then((res: Response) => res.text())
      .then((text: string) => {
        dictRef.current = text.split(/\r?\n/).map((w: string) => w.trim()).filter(Boolean);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dictionary');
        setLoading(false);
      });
  }, []);

  // Game Logic
  useEffect(() => {
    // If the game is not playing, then we don't need to find a word.
    if (!isPlaying) return;
    // If we're still loading, then we don't need to find a word.
    if (loading) return;
    // If the dictionary is not loaded, then we need to load it. This shouldn't happen.
    const dict = dictRef.current;
    if (dict === null) return;

    setLoading(true);
    let maxScore: number = -1;
    let maxWord: string | null = null;
    
    // Iterate through the dictionary and find the best word.
    for (const candidate of dict) {
      if (canForm(candidate.toUpperCase(), rack.toUpperCase(), word.toUpperCase())) {
        // Getting here means that we found a potentially valid word.
        // First, we check the score of the candidate.
        const candidateScore: number = scoreWord(candidate);
        // If the candidate score is the same as the max score and the candidate is lexicographically less than the max word, then we update the max word.
        if (!!maxWord && candidateScore === maxScore && candidate.localeCompare(maxWord) < 0) {
          maxWord = candidate;
        }
        // If the candidate score is greater than the max score, then we update the max score and the max word.
        if (candidateScore > maxScore) {
          maxScore = candidateScore;
          maxWord = candidate;
        }
      }
    }
    if (maxScore === -1) {
        setError("No valid word found");
        setLoading(false);
        return;
    }
    setBestWord(maxWord);
    setScore(maxScore);
    setLoading(false);
  }, [rack, word, isPlaying, loading]);

  return { bestWord, loading, error, score, clearFindWord };
};

export default useFindWord;