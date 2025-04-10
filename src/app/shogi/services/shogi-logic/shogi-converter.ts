import {Koma, LATIN_TO_CSA, PlayerType, promotePiece} from '../../interfaces/koma';
import {Move} from '../../interfaces/move';

export class ShogiConverter {
  public static boardStateToCSA(state: (Koma | undefined)[][], firstPlayer: PlayerType): string {
    let result = "V2.2\n"
    for (let i = 0; i < state.length; i++) {
      result += "P" + (i + 1);
      for (let tile of state[i]) {
        if (tile === undefined) {
          result += " * "
        } else if (tile.player === firstPlayer) {
          result += "+" + LATIN_TO_CSA[tile.kind]
        } else {
          result += "-" + LATIN_TO_CSA[tile.kind]
        }
      }
      if (i !== state.length - 1) {
        result += "\n"
      }
    }
    return result;
  }

  public static moveToCSA(move: Move, firstPlayer: PlayerType): string {
    let result = firstPlayer === move.player ? "+" : "-";
    result += move.origin ?
      (({x, y}) => `${x}${y}`)(ShogiConverter.virtualCoordinatesToReal(move.origin.x, move.origin.y)) : "00"
    result += (({x, y}) => `${x}${y}`)(ShogiConverter.virtualCoordinatesToReal(move.destination.x, move.destination.y));
    result += move.promotion === "*" ? LATIN_TO_CSA[promotePiece(move.koma)] : LATIN_TO_CSA[move.koma];
    return result;
  }

  // shogi boards are japanese x is left to right also index starts at 1
  public static virtualCoordinatesToReal(x: number, y: number): { x: number, y: number } {
    return {x: 9 - x, y: y + 1};
  }

  public static gameToCSA(state: (Koma | undefined)[][], moves: Move[]): string {
    if (moves.length === 0) {
      return ShogiConverter.boardStateToCSA(state, "sente") + "\n+";
    }
    const firstPlayer = moves[0].player;
    let result = "";
    result += ShogiConverter.boardStateToCSA(state, firstPlayer);
    result += "\n+\n";
    result = moves.reduce((result, move) => {
      return result + ShogiConverter.moveToCSA(move, firstPlayer) + "\n";
    }, result)
    return result + "%TORYO";
  }
}
