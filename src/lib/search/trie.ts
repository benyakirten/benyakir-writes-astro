export type CompletionOption = { word: string; weight: number };

class TrieNode {
  readonly children = new Map<string, TrieNode>();
  weight: number | null = null;
}

export class Trie {
  private readonly root = new TrieNode();
  readonly words: string[] = [];

  constructor(entries: readonly (readonly [string, number])[] = []) {
    for (const [word, weight] of entries) this.insert(word, weight);
  }

  insert(word: string, weight: number): void {
    this.words.push(word);
    let node = this.root;
    for (let index = 0; index < word.length; index++) {
      const character = word[index];
      let next = node.children.get(character);
      if (!next) {
        next = new TrieNode();
        node.children.set(character, next);
      }
      node = next;
    }
    node.weight = weight;
  }

  suggest(prefix: string): CompletionOption[] | null {
    if (!prefix) return null;
    let node = this.root;
    for (let index = 0; index < prefix.length; index++) {
      const next = node.children.get(prefix[index]);
      if (!next) return null;
      node = next;
    }

    const options: CompletionOption[] = [];
    const visit = (current: TrieNode, value: string, isPrefix: boolean) => {
      if (!isPrefix && current.weight !== null) {
        options.push({ word: value, weight: current.weight });
      }
      for (const [character, child] of current.children) {
        visit(child, value + character, false);
      }
    };
    visit(node, prefix, true);
    if (options.length === 0) return null;
    return options.sort((a, b) => b.weight - a.weight);
  }

  getLevenshteinDistance(left: string, right: string): number {
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i++) {
      let diagonal = previous[0];
      previous[0] = i;
      for (let j = 1; j <= right.length; j++) {
        const above = previous[j];
        previous[j] = left[i - 1] === right[j - 1]
          ? diagonal
          : Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + 1);
        diagonal = above;
      }
    }
    return previous[right.length];
  }

  getClosestLevenshteinSuggestions(query: string): string[] {
    return this.words
      .map((word, index) => ({ word, index, distance: this.getLevenshteinDistance(query, word) }))
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .slice(0, 5)
      .map(({ word }) => word);
  }
}
