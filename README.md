NGator.Node
=====
Simple news aggregator, based on TEAN stack (Typescript-Express-Angular-NodeJS).

Following technologies are used:

- NodeJS v.6.3;
- Express v.4 (+ socket.io);
- Angular v.1.5 (+ angular-ui);
- TypeScript v.1.8;
- Gulp;
- TSLint.

Installation & launch sequence
=====

####
Installation:
```
npm install
```
Launch: 
```
gulp
npm start
```
and navigate your favorite browser to [http://locahost:3000](http://locahost:3000).

Or open `NGator.Node.sln` at Visual Studio 2015 after 
```
npm install
```
and hit F5.

If you use Windows development environment, you might encounter following compilation error during installation: 
```
d:\Dev\GitHub\NGator.Node\node_modules\iconv>if not defined npm_config_node_gyp (node "D:\Program Files (x86)\nodejs\node_modules\npm\bin\node-gyp-bin\\..\..\node_modules\node-gyp\bin\node-gyp.js" rebuild )  else (node "" rebuild )
Building the projects in this solution one at a time. To enable parallel build, please add the "/m" switch.
  binding.cc
  iconv.c
  win_delay_load_hook.c
D:\Program Files (x86)\nodejs\node_modules\npm\node_modules\node-gyp\src\win_delay_load_hook.c(35): error C2373: '__pfn
DliNotifyHook2': redefinition; different type modifiers [d:\Dev\GitHub\NGator.Node\node_modules\iconv\build\iconv.vcxpr
oj]
  C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\include\delayimp.h(134): note: see declaration of '__pfnDliNot
  ifyHook2'
```
```delayimp.h``` states:
```
// Prior to Visual Studio 2015 Update 3, these hooks were non-const.  They were
// made const to improve security (global, writable function pointers are bad).
// If for backwards compatibility you require the hooks to be writable, define
// the macro DELAYIMP_INSECURE_WRITABLE_HOOKS prior to including this header and
// provide your own non-const definition of the hooks.
```
Tho solve this problem, just add macro ```#define DELAYIMP_INSECURE_WRITABLE_HOOKS``` to your  ```nodejs\node_modules\npm\node_modules\node-gyp\src\win_delay_load_hook.c``` so it should look like this:
```C++
/*
 * When this file is linked to a DLL, it sets up a delay-load hook that
 * intervenes when the DLL is trying to load 'node.exe' or 'iojs.exe'
 * dynamically. Instead of trying to locate the .exe file it'll just return
 * a handle to the process image.
 *
 * This allows compiled addons to work when node.exe or iojs.exe is renamed.
 */

#ifdef _MSC_VER

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#define DELAYIMP_INSECURE_WRITABLE_HOOKS

#include <windows.h>

#include <delayimp.h>
#include <string.h>

static FARPROC WINAPI load_exe_hook(unsigned int event, DelayLoadInfo* info) {
  HMODULE m;
  if (event != dliNotePreLoadLibrary)
    return NULL;

  if (_stricmp(info->szDll, "iojs.exe") != 0 &&
      _stricmp(info->szDll, "node.exe") != 0)
    return NULL;

  m = GetModuleHandle(NULL);
  return (FARPROC) m;
}

PfnDliHook __pfnDliNotifyHook2 = load_exe_hook;

#endif

```

And repeat.

This project is also deployed at Force.com/Heroku cloud: 
[http://ngator-node.herokuapp.com](http://ngator-node.herokuapp.com).