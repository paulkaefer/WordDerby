import type { Word } from "../../engine/types";

interface WordBlanksProps {
  words: Word[];
}

/** Renders each word's letters as revealed characters or hidden blanks.
 * State is conveyed via text/aria labels, never color alone (FR-029). */
export function WordBlanks({ words }: WordBlanksProps) {
  return (
    <div className="word-blanks" role="group" aria-label="Puzzle words">
      {words.map((word, wordIndex) => (
        <div className="word-blanks__word" key={wordIndex}>
          {word.letters.map((slot, slotIndex) => {
            if (!slot.guessable) {
              return (
                <span key={slotIndex} className="word-blanks__punctuation" aria-hidden="true">
                  {slot.char}
                </span>
              );
            }
            if (slot.revealed) {
              return (
                <span
                  key={slotIndex}
                  className="word-blanks__letter word-blanks__letter--revealed"
                  aria-label={`revealed letter ${slot.char}`}
                >
                  {slot.char}
                </span>
              );
            }
            return (
              <span
                key={slotIndex}
                className="word-blanks__letter word-blanks__letter--hidden"
                aria-label="hidden letter"
              >
                _
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
