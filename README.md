## NodeCanvas
Make use of visual programming to simplify the use of resource planning
libraries in your business and life.

### Dependencies
The following software must be installed locally and be accessible on
the system's \$PATH:
  * make
  * npm and node
  * A compiler for C++ (g++ and clang++ have both been tested)
  * mongodb
  * python 3.5
Additionally the following is also required:
  * A working internet connection
  * If it is not already present a clone of the or-tools project from
     GitHub.

### Set-up
Before running the following steps are necessary:
  1. Run `npm install` in the project's directory
  2. Install the ortools package with python pip (`python -m pip install --user
     ortools`)
  3. Optionally compile one of the or-tools examples to confirm everything
     is working. If this fails then running the application is also likely
     to fail.

Finally run `npm run devStart` and the application will be started on localhost
port 3000.
