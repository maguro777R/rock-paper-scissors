import { useMemo, useState } from "react";

const MOVES = [
  { id: "rock", label: "グー", short: "拳", beats: "scissors" },
  { id: "scissors", label: "チョキ", short: "鋏", beats: "paper" },
  { id: "paper", label: "パー", short: "掌", beats: "rock" },
];

const MAX_ROUNDS = 5;

const getMove = (id) => MOVES.find((move) => move.id === id);

const getWinningMoveAgainst = (moveId) =>
  MOVES.find((move) => move.beats === moveId);

const getRoundResult = (playerId, opponentId) => {
  if (playerId === opponentId) return "draw";
  return getMove(playerId).beats === opponentId ? "win" : "loss";
};

const getResultText = (result) => {
  if (result === "win") return "一本";
  if (result === "loss") return "取られた";
  return "あいこ";
};

const getResultDetail = (result) => {
  if (result === "win") return "こちらの読みが通った。";
  if (result === "loss") return "相手に流れを取られた。";
  return "間合いは五分。次で崩す。";
};

const chooseRandomMove = () =>
  MOVES[Math.floor(Math.random() * MOVES.length)];

const chooseOpponentMove = (history) => {
  if (history.length < 3) return chooseRandomMove();

  const counts = MOVES.reduce(
    (acc, move) => ({ ...acc, [move.id]: 0 }),
    {},
  );

  history.slice(-4).forEach((round) => {
    counts[round.player.id] += 1;
  });

  const likelyPlayerMove = MOVES.reduce((current, move) =>
    counts[move.id] > counts[current.id] ? move : current,
  );

  if (Math.random() < 0.58) {
    return getWinningMoveAgainst(likelyPlayerMove.id);
  }

  return chooseRandomMove();
};

const createScore = (history) =>
  history.reduce(
    (score, round) => {
      if (round.result === "win") score.player += 1;
      if (round.result === "loss") score.opponent += 1;
      if (round.result === "draw") score.draw += 1;
      return score;
    },
    { player: 0, opponent: 0, draw: 0 },
  );

const getMatchResult = (score) => {
  if (score.player > score.opponent) {
    return {
      title: "勝利",
      body: "五番勝負を制した。次は読まれる前に型を変える。",
    };
  }

  if (score.player < score.opponent) {
    return {
      title: "敗北",
      body: "相手の観察が上回った。単調な手は次で捨てる。",
    };
  }

  return {
    title: "引き分け",
    body: "決着はつかない。もう一勝負で白黒をつける。",
  };
};

function App() {
  const [history, setHistory] = useState([]);
  const [lastRound, setLastRound] = useState(null);

  const score = useMemo(() => createScore(history), [history]);
  const isFinished = history.length >= MAX_ROUNDS;
  const matchResult = isFinished ? getMatchResult(score) : null;
  const currentRound = Math.min(history.length + 1, MAX_ROUNDS);

  const playRound = (playerMove) => {
    if (isFinished) return;

    const opponentMove = chooseOpponentMove(history);
    const result = getRoundResult(playerMove.id, opponentMove.id);
    const nextRound = {
      id: crypto.randomUUID(),
      round: history.length + 1,
      player: playerMove,
      opponent: opponentMove,
      result,
    };

    setHistory((rounds) => [...rounds, nextRound]);
    setLastRound(nextRound);
  };

  const resetGame = () => {
    setHistory([]);
    setLastRound(null);
  };

  return (
    <main className="game-shell">
      <section className="hero" aria-label="道場じゃんけん">
        <div className="hero__shade" />
        <div className="game-layout">
          <section className="duel-panel" aria-live="polite">
            <div className="round-status">
              <span>五番勝負</span>
              <strong>
                {isFinished ? "決着" : `第 ${currentRound} 局`}
              </strong>
            </div>

            <div className="title-block">
              <p className="eyebrow">Dojo Rock Paper Scissors</p>
              <h1>道場じゃんけん</h1>
              <p>
                相手は直近の癖を少し読む。手を固定すると、当然そこを突かれる。
              </p>
            </div>

            <div className="scoreboard" aria-label="現在のスコア">
              <div>
                <span>あなた</span>
                <strong>{score.player}</strong>
              </div>
              <div>
                <span>相手</span>
                <strong>{score.opponent}</strong>
              </div>
              <div>
                <span>あいこ</span>
                <strong>{score.draw}</strong>
              </div>
            </div>

            <div className="move-area">
              <div className="opponent-readout">
                <span>相手の手</span>
                <strong>{lastRound ? lastRound.opponent.label : "未定"}</strong>
              </div>
              <div className="result-box" data-testid="round-result">
                {lastRound ? (
                  <>
                    <span>{getResultText(lastRound.result)}</span>
                    <strong>
                      {lastRound.player.label} 対 {lastRound.opponent.label}
                    </strong>
                    <p>{getResultDetail(lastRound.result)}</p>
                  </>
                ) : (
                  <>
                    <span>開始前</span>
                    <strong>初手を選ぶ</strong>
                    <p>五局で勝ち越せば勝利。</p>
                  </>
                )}
              </div>
            </div>

            <div className="move-buttons" aria-label="出す手を選択">
              {MOVES.map((move) => (
                <button
                  className="move-button"
                  type="button"
                  key={move.id}
                  onClick={() => playRound(move)}
                  disabled={isFinished}
                  data-testid={`move-${move.id}`}
                >
                  <span aria-hidden="true">{move.short}</span>
                  <strong>{move.label}</strong>
                </button>
              ))}
            </div>

            {matchResult ? (
              <div className="match-result" data-testid="match-result">
                <span>最終結果</span>
                <strong>{matchResult.title}</strong>
                <p>{matchResult.body}</p>
              </div>
            ) : null}

            <button className="reset-button" type="button" onClick={resetGame}>
              最初から
            </button>
          </section>

          <aside className="opponent-panel" aria-label="対戦相手">
            <div className="opponent-card">
              <img src="/assets/opponent.png" alt="和装の対戦相手" />
              <div>
                <span>対戦相手</span>
                <strong>紗月</strong>
                <p>観察型。あなたの癖を見てから踏み込む。</p>
              </div>
            </div>
          </aside>

          <section className="history-panel" aria-label="勝負履歴">
            <div className="history-header">
              <span>履歴</span>
              <strong>{history.length} / {MAX_ROUNDS}</strong>
            </div>
            <ol>
              {Array.from({ length: MAX_ROUNDS }).map((_, index) => {
                const round = history[index];
                return (
                  <li key={index} className={round ? `is-${round.result}` : ""}>
                    {round ? (
                      <>
                        <span>第 {round.round} 局</span>
                        <strong>
                          {round.player.label} / {round.opponent.label}
                        </strong>
                        <em>{getResultText(round.result)}</em>
                      </>
                    ) : (
                      <>
                        <span>第 {index + 1} 局</span>
                        <strong>待機</strong>
                        <em>未</em>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
