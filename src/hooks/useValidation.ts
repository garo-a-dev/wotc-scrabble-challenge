import { useState, useEffect, useCallback } from "react";
import type { LetterDataRecord } from "../types";
import letterData from '../assets/letter_data.json';


const MIN_RACK_LENGTH = 1;
const MAX_RACK_LENGTH = 7;

export type ValidationError = {
    field: 'rack' | 'word' | 'game';
    message: string;
}

export type UseFindValidationResult = {
    isValid: boolean | null;
    validationError: ValidationError | null;
    clearValidation: () => void;
}

/**
 * Simple grouping function that will get an array of letters and then return a record of the count of each letter.
 * @param gameLetters 
 * @returns 
 */
const groupByLetter = (gameLetters: string[]): Record<string, number> => {
    const count: Record<string, number> = {};
    gameLetters.forEach((letter: string) => {
        count[letter.toUpperCase()] = (count[letter.toUpperCase()] || 0) + 1;
    });
    return count;
}


/**
 * @param rack - The rack of letters to validate against
 * @param word - The word to validate
 * @returns - Whether the current setup is valid to to find the optimal scabble word.
 */
const useValidation = (rack: string, word: string = '', isPlaying: boolean): UseFindValidationResult => {
    const [isValid, setIsValid] = useState<boolean | null >(null);
    const [validationError, setValidationError] = useState<ValidationError | null>(null);

    const clearValidation = () => {
        setIsValid(null);
        setValidationError(null);
    }

    useEffect(() => {
        if (!isPlaying) {
            return;
        }
        // First, check if the rack contains any numbers.
        if (/\d/.test(rack)) {
            setValidationError({ field: 'rack', message: `Rack cannot contain numbers` });
            setIsValid(false);
            return;
        }
        // Second, check if the word contains any numbers.
        if (/\d/.test(word)) {
            setValidationError({ field: 'word', message: `Word cannot contain numbers` });
            setIsValid(false);
            return;
        }
        // Third check the rack length
        if (rack.length < MIN_RACK_LENGTH || rack.length > MAX_RACK_LENGTH) {
            setValidationError({ field: 'rack', message: `Rack must be between ${MIN_RACK_LENGTH} and ${MAX_RACK_LENGTH} letters` });
            setIsValid(false);
            return;
        }
        // Finally, check is the tiles count for any letter exceeds the count in the letterData
        const allTiles: string[] = rack.split('').concat(word.split(''))
        const tileCount: Record<string, number> = groupByLetter(allTiles);
        const letterDataRecord: LetterDataRecord = letterData as LetterDataRecord;
        for (const [letter, count] of Object.entries(tileCount)) {
            if (count > letterDataRecord[letter]?.tiles) {
                setValidationError({ field: 'game', message: `Game cannot have more than ${letterDataRecord[letter].tiles} tiles of ${letter}` });
                setIsValid(false);
                return;
            }
        }
        // If we get here, then the setup is valid
        setIsValid(true);
        setValidationError(null);
    }, [rack, word, isPlaying]);

    return { isValid, validationError, clearValidation };
}

export default useValidation;