import * as ts from 'typescript';
import * as Lint from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new FunctionKeywordReact(sourceFile, this.getOptions())
    );
  }
}

const FAILURE_STRING = 'prefer function keyword for React elements';

const isPascalCase = (name: string) => {
  const firstCharacter = name[0];
  const lastCharacter = name[name.length - 1];
  const middle = name.slice(1, -1);

  if (firstCharacter === '_') {
    return false;
  }
  if (lastCharacter === '_') {
    return false;
  }
  if (firstCharacter.toLowerCase() === firstCharacter) {
    return false;
  }
  if (middle.indexOf('_') !== -1) {
    return false;
  }
  return true;
};

class FunctionKeywordReact extends Lint.RuleWalker {
  visitVariableDeclaration(node: ts.VariableDeclaration) {
    if (!node.initializer) {
      return;
    }

    const name = node.name.getText();

    if (
      node.initializer.kind === ts.SyntaxKind.ArrowFunction &&
      (node.initializer as ts.ArrowFunction).body.kind ===
        ts.SyntaxKind.Block &&
      isPascalCase(name)
    ) {
      this.addFailureAtNode(node, FAILURE_STRING);
    }
  }
}
