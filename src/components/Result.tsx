import cn from "classnames";
import { useMemo } from "react";
import twemoji from "twemoji";
import { NUM_BOARDS, NUM_GUESSES } from "../consts";
import { allWordsGuessed, formatTimeElapsed } from "../funcs";
import { useSelector } from "../store";

type ResultProps = {
  hidden: boolean;
};
export default function Result(props: ResultProps) {
  const practice = useSelector((s) => s.game.practice);
  const id = useSelector((s) => s.game.id);
  const targets = useSelector((s) => s.game.targets);
  const guesses = useSelector((s) => s.game.guesses);
  const showTimer = useSelector((s) => s.settings.showTimer);
  const timeElapsed = useSelector((s) => s.game.endTime - s.game.startTime);

  const shareableText = useMemo(() => {
    const targetGuessCounts: (number | null)[] = [];
    for (const target of targets) {
      const idx = guesses.indexOf(target);
      targetGuessCounts.push(idx === -1 ? null : idx + 1);
    }
    const guessCount = allWordsGuessed(guesses, targets)
      ? guesses.length
      : null;
    return getShareableText(
      practice,
      id,
      guessCount,
      targetGuessCounts,
      showTimer ? timeElapsed : null
    );
  }, [practice, id, targets, guesses, showTimer, timeElapsed]);
  const parsed = twemoji.parse(shareableText) + "\n";
  const handleCopyToClipboardClick = () => {
    navigator.clipboard
      .writeText(shareableText)
      .then(() => alert("Copied results to clipboard!"))
      .catch(() => alert("There was an error copying text to the clipboard"));
  };

  return (
    <div className={cn("result", props.hidden && "hidden")}>
      <div className="share">
        <pre className="text" dangerouslySetInnerHTML={{ __html: parsed }} />
        <button onClick={handleCopyToClipboardClick}>copy to clipboard</button>
      </div>
      <div className="words">
        {targets.map((target, i) => (
          <p key={i}>{target}</p>
        ))}
      </div>
    </div>
  );
}

const EMOJI_MAP = [
  ["0", "0️⃣"],
  ["1", "1️⃣"],
  ["2", "2️⃣"],
  ["3", "3️⃣"],
  ["4", "4️⃣"],
  ["5", "5️⃣"],
  ["6", "6️⃣"],
  ["7", "7️⃣"],
  ["8", "8️⃣"],
  ["9", "9️⃣"],
];

function getShareableText(
  practice: boolean,
  id: number,
  guessCount: number | null,
  targetGuessCounts: (number | null)[],
  timeElapsed: number | null
) {
  const text = [];
  if (practice) {
    text.push(`Practice Tetrahexagordle\n`);
  } else {
    text.push(`Daily Tetrahexagordle #${id}\n`);
  }
  text.push(`Guesses: ${guessCount ?? "X"}/${NUM_GUESSES}\n`);
  if (timeElapsed !== null) {
    text.push(`Time: ${formatTimeElapsed(timeElapsed)}\n`);
  }
  const cols = 8;
  const rows = Math.ceil(NUM_BOARDS / cols);
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      if (idx > NUM_BOARDS) continue;
      const guessCount = targetGuessCounts[idx];
      if (guessCount === null) {
        row.push("🟥🟥");
      } else {
        let text = guessCount.toString().padStart(2, "0");
        for (const [num, emoji] of EMOJI_MAP) {
          text = text.replaceAll(num, emoji);
        }
        row.push(text);
      }
    }

    text.push(row.join(" ") + "\n");
  }
  text.push("https://tetrahexagordle.nailuj29gaming.repl.co/");
  return text.join("");
}
