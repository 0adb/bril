import * as bril2 from './bril2.ts';

/**
 * A utility for building up Bril2 programs.
 */
export class Builder {
  /**
   * The program we have built so far.
   */
  public program: bril2.Program = { functions: [] };

  private curFunction: bril2.Function | null = null;
  private nextFresh: number = 0;

  /**
   * Create a new, empty function into which further code will be generated.
   */
  buildFunction(name: string, args: bril2.Argument[], type?: bril2.Type) {
    let func: bril2.Function;
    if (type === undefined) {
      func = {name: name, instrs: [], args: args};
    } else {
      func = {name: name, instrs: [], args: args, type: type};
    }
    this.program.functions.push(func);
    this.curFunction = func;
    this.nextFresh = 0;
    return func;
  }

  /**
   * Build an operation instruction that produces a result. If the name is
   * omitted, a fresh variable is chosen automatically.
   */
  buildValue(op: bril.ValueOpCode, type: bril2.Type,
             args: string[], funcs?: string[], labels?: string[],
             dest?: string) {
    dest = dest || this.freshVar();
    let instr: bril.ValueOperation = { op, dest, type, args, funcs, labels };
    this.insert(instr);
    return instr;
  }

  /**
   * Build a non-value-producing (side-effecting) operation instruction.
   */
  buildEffect(op: bril2.EffectOpCode,
              args: string[], funcs?: string[], labels?: string[]) {
    let instr: bril2.EffectOperation = { op, args, funcs, labels };
    this.insert(instr);
    return instr;
  }

  /**
   * Build a function call operation. If a type is specified, the call
   * produces a return value.
   */
  buildCall(func: string, args: string[],
            type: bril2.Type, dest?: string): bril2.ValueOperation;
  buildCall(func: string, args: string[],
            type?: undefined, dest?: string): bril2.EffectOperation;
  buildCall(func: string, args: string[],
            type?: bril2.Type, dest?: string): bril2.Operation {
    if (type) {
      return this.buildValue("call", type, args, [func], undefined, dest);
    } else {
      return this.buildEffect("call", args, [func], undefined);
    }
  }

  /**
   * Build a constant instruction. As above, the destination name is optional.
   */
  buildConst(value: bril2.Value, type: bril2.Type, dest?: string) {
    dest = dest || this.freshVar();
    let instr: bril2.Constant = { op: "const", value, dest, type };
    this.insert(instr);
    return instr;
  }

  /**
   * Build a constant integer value.
   */
  buildInt(value: number, dest?: string) {
    return this.buildConst(value, "int", dest);
  }

  /**
   * Build a constant boolean value.
   */
  buildBool(value: boolean, dest?: string) {
    return this.buildConst(value, "bool", dest);
  }

  /**
   * Build a constant floating-point value.
   */
  buildFloat(value: number, dest?: string) {
    return this.buildConst(value, "float", dest);
  }

  /**
   * Build a constant character value.
   */
  buildChar(value: string, dest?: string) {
    return this.buildConst(value, "char", dest);
  }

  /**
   * Add a label to the function at the current position.
   */
  buildLabel(name: string) {
    let label = {label: name};
    this.insert(label);
  }

  /**
   * Insert an instruction at the end of the current function.
   */
  private insert(instr: bril2.Instruction | bril2.Label) {
    if (!this.curFunction) {
      throw "cannot build instruction/label without a function";
    }
    this.curFunction.instrs.push(instr);
  }

  /**
   * Checks whether the last emitted instruction in the current function is the specified op code.
   * Useful for checking for terminating instructions.
   */
  getLastInstr(): bril2.Instruction | undefined {
    if (!this.curFunction) {
      return undefined
    }

    if (!this.curFunction.instrs) {
      return undefined
    }

    if (this.curFunction.instrs.length === 0) {
      return undefined
    }

    const last_instr : bril2.Instruction | bril2.Label = this.curFunction.instrs[this.curFunction.instrs.length - 1];

    if ('label' in last_instr) {
      return undefined
    }

    return last_instr
  }

  /**
   * Generate an unused variable name.
   */
  freshVar() {
    let out = 'v' + this.nextFresh.toString();
    this.nextFresh += 1;
    return out;
  }

  /**
   * Generate an unused suffix.
   */
  freshSuffix() {
    let out = '.' + this.nextFresh.toString();
    this.nextFresh += 1;
    return out;
  }

  setCurrentFunction(func: bril2.Function) {
    this.curFunction = func;
  }
}
