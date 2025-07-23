import { useState, useEffect } from "react";
import type { LetterDataRecord } from "../types";
import letterDataJson from '../assets/letter_data.json';


const MIN_RACK_LENGTH = 1;
const MAX_RACK_LENGTH = 7;

// Represents the different types of errors that can occur during validation.
export type ValidationError = Record<"rack" | "word" | "game", string[]>;

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

    const clearValidation: () => void = () => {
        setIsValid(null);
        setValidationError(null);
    }

    useEffect(() => {
        if (!isPlaying) {
            return;
        }

        const errors: ValidationError = {
            rack: [],
            word: [],
            game: []
        }

        let currentValidity: boolean = true;

        // First, check if the rack contains any numbers.
        if (/\d/.test(rack)) {
            errors.rack.push(`Rack cannot contain numbers`)
            currentValidity = false;
        }

        // Second, check if the word contains any numbers.
        if (/\d/.test(word)) {
            errors.word.push(`Word cannot contain numbers`)
            currentValidity = false;
        }

        // Third check the rack length
        if (rack.length < MIN_RACK_LENGTH || rack.length > MAX_RACK_LENGTH) {
            errors.rack.push(`Rack must be between ${MIN_RACK_LENGTH} and ${MAX_RACK_LENGTH} letters`)
            currentValidity = false;
        }

        // Finally, check is the tiles count for any letter exceeds the count in the letterData
        const allTiles: string[] = rack.split('').concat(word.split(''));
        const tileCount: Record<string, number> = groupByLetter(allTiles);
        const letterData: LetterDataRecord = letterDataJson as LetterDataRecord;

        for (const [letter, count] of Object.entries(tileCount)) {
            if (count > letterData[letter]?.tiles) {
                errors.game.push(`Game cannot have more than ${letterData[letter].tiles} tiles of ${letter}`)
                currentValidity = false;
            }
        }

        setIsValid(currentValidity);
        setValidationError(errors);
    }, [rack, word, isPlaying]);

    return { isValid, validationError, clearValidation };
}

export default useValidation;