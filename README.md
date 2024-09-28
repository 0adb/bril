Bril Redesign Attempt: Bril2
====================

This is a fork of [Bril](https://github.com/sampsyo/bril), made for me to try out redesigning Bril in consideration of the "swap problem" mentioned at [this issue](https://github.com/sampsyo/bril).

I have no affiliation with the people that actually made Bril. See [this link](#original_docs) for the original README, or you can go to the original repo.

Here are some docs for my specific changes to the repo:

`bril2` and `bril2i.ts`
----------
My first implementation steps were to make an exact copy of `bril2i.ts`, `bril-ts`, and `bril-txt` so that I could independently make changes to my copies while not losing access to the original Bril interpreter. Hence, they're now all `bril2*`. 

To get the `bril2i` command, run `deno install bril2i.ts` from the base directory.
To get its dependency `bril22json`, `cd` into `bril2-txt` and run  `pip install --user flit` (after having installed `flit`).

To use the `bril2i` command, one can for example run:
```
bril22json < test/interp/ssa/ssa-two-phi.bril | bril2i true
```
where `test/interp/ssa/ssa-two-phi.bril` is the Bril file, and `true` is the argument to the `main` function. Currently, I'm avoiding rewriting the parser and/or changing the syntax of a Bril program, just modifying the interpreter itself, so the current test cases should still fly using `bril2i.ts`.

The general plan of attack is:
- During function execution, there will be extra state (for now, called phi-state) maintained alongside the heap.
- On entering a label, the set of instructions between it and the "next" label (in order of appearance in the function text, not execution) is scanned for all variables that are phi-read from (i.e. appear as choices at phi points).
- phi-state will be cleared and filled with the current values of the phi-read from variables.
- For assignments, if assigning from phi, phi-state will be first searched before searching the heap. 

<a name="original_docs" ></a>


Bril: A Compiler Intermediate Representation for Learning
=========================================================

Bril (the Big Red Intermediate Language) is a compiler IR made for teaching [CS 6120][cs6120], a grad compilers course.
It is an extremely simple instruction-based IR that is meant to be extended.
Its canonical representation is JSON, which makes it easy to build tools from scratch to manipulate it.

This repository contains the [documentation][docs], including the [language reference document][langref], and some infrastructure for Bril.
There are some quick-start instructions below for some of the main tools, but
check out the docs for more details about what's available.

[docs]: https://capra.cs.cornell.edu/bril/
[langref]: https://capra.cs.cornell.edu/bril/lang/index.html
[brilts]: https://github.com/sampsyo/bril/blob/master/bril-ts/bril.ts


Install the Tools
-----------------

### Reference Interpreter

You will want the IR interpreter, which uses [Deno][].
Just type this:

    $ deno install brili.ts

As Deno tells you, you will then need to add `$HOME/.deno/bin` to [your `$PATH`][path].
You will then have `brili`, which takes a Bril program as JSON on stdin and executes it.

[deno]: https://deno.land
[path]: https://unix.stackexchange.com/a/26059/61192

### Text Format

The parser & pretty printer for the human-editable text form of Bril are written for Python 3.
To install them, you need [Flit][], so run this:

    $ pip install --user flit

Then, go to the `bril-txt` directory and use Flit to install symlinks to the tools:

    $ flit install --symlink --user

The tools are called `bril2json` and `bril2txt`.
They also take input on stdin and produce output on stdout.

[flit]: https://flit.readthedocs.io/


Tests
-----

There are some tests in the `test/` directory.
They use [Turnt][], which lets us write the expected output for individual commands.
Install it with [pip][]:

    $ pip install --user turnt

Then run all the tests by typing `make test`.

[pip]: https://packaging.python.org/tutorials/installing-packages/
[cs6120]: https://www.cs.cornell.edu/courses/cs6120/2020fa/
[turnt]: https://github.com/cucapra/turnt
