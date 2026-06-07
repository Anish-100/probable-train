# Finals Prep — Mistakes to Review

A running log of bugs/concepts to drill. Oldest first, newest at bottom.

---
## Q1 — `my_strstr` (C-strings, pointers)

**Biggest issues:**
1. Pointer vs value: dereference before comparing to `'\0'` (`*h`, not `h`).
2. Return type: `strstr` returns a **pointer**, not an int (`*h - *n` is `strcmp`).
3. **Mismatch must `break` the inner loop, not `return`** — else `"aaab"`/`"aab"` misses match at i=1.
4. Inner loop must stop on mismatch; just walking to `'\0'` gives false positives (`"xyz"`/`"yz"`).
5. Return the **start** `haystack+i`, not the walked `h`. Empty needle `""` is its own edge case.

```cpp
const char* my_strstr(const char* haystack, const char* needle) {
    for (const char* h0 = haystack; ; ++h0) {
        const char *h = h0, *n = needle;
        while (*n != '\0' && *h == *n) { ++h; ++n; }
        if (*n == '\0')  return h0;       // matched all of needle
        if (*h0 == '\0') return nullptr;  // ran out of haystack
    }
}
```

## Q2 — Rule of Three / copy semantics (conceptual)

**Biggest issues:**
1. Wrong: "no copy ctor, fails at `b=a`." The compiler **implicitly generates** a copy ctor;
   it **compiles and runs**. A user destructor does NOT suppress it.
2. The real bug = **shallow copy**: the implicit copy ctor copies the `int*` pointer, so `a` and
   `b` alias the same array → **double free at destruction** (end of scope), NOT at the copy.
3. Deep-copy ctor must take `const Buffer&` (missing `const` breaks copying const/temporaries).
4. Allocating `new int[len]` is not a deep copy by itself — must copy the elements too.

```cpp
Buffer(const Buffer& other);              // + Rule of Three:
Buffer& operator=(const Buffer& other);
~Buffer();
```

## Q3 — `reverse_in_place` (linked list, O(1) space)

**Biggest issues:**
1. **Need THREE pointers (`prev`, `curr`, `next`), not two.** Must save `curr->next` into `next`
   **before** rewiring `curr->next = prev`, or you overwrite your only link to the rest of the
   list and walk backward into `prev`. (#1 reversal mistake.)
2. `curr != nullptr`, not `*curr != nullptr` — don't dereference when checking a pointer.
3. Return `prev` (new head), and declare `curr` OUTSIDE the loop or it's out of scope at `return`.
4. **Loop on `curr != nullptr`, NOT `curr->next != nullptr`.** The latter crashes on empty list
   (derefs null) AND skips the last node. Then `return prev` (curr is null at exit), not `curr`.

```cpp
Node* reverse_in_place(Node* head) {
    Node* prev = nullptr;
    Node* curr = head;
    while (curr) { Node* next = curr->next; curr->next = prev; prev = curr; curr = next; }
    return prev;   // empty + single-node fall out for free
}
```

## Q4 — `top_words` (vector / algorithm / lambdas)

**Biggest issues (the 3 canonical STL pitfalls):**
1. **Algorithms never allocate.** `copy_if` into `vec.begin()` of an empty vector = UB. Use
   `std::back_inserter(out)` to push.
2. **`std::transform` needs an OUTPUT iterator** (`transform(in, in_end, out, fn)`); for in-place
   pass the same begin. There is NO whole-string uppercase — transform each **char** with
   `std::toupper`, and cast to `unsigned char` first (negative char to toupper = UB).
3. **`std::unique` does NOT resize.** It returns the new logical end; you must
   `vec.erase(last, vec.end())` — the **erase–remove idiom**. Also it's `unique`, not `unique_cpy`.

```cpp
std::copy_if(words.begin(), words.end(), std::back_inserter(result),
             [minLen](const std::string& s){ return (int)s.size() >= minLen; });
for (auto& w : result)
    std::transform(w.begin(), w.end(), w.begin(),
                   [](unsigned char c){ return std::toupper(c); });
auto last = std::unique(result.begin(), result.end());
result.erase(last, result.end());
```

## Q5 — polymorphism / virtual dispatch (conceptual) — 7.5/10

**The miss (Part B):** "which init runs during the *Base ctor*?" → **Base::init ONLY**. The override
is **suppressed** during base construction (object's dynamic type is still `Base`, vtable not yet
upgraded). I described ctor *ordering* instead of saying the override doesn't fire — that's the trap.

**Other traps (got these, sharpen wording):**
1. Non-virtual `greet()` → **static dispatch** by *pointer* type → `Base::greet`. (virtual=dynamic)
2. (the B miss above)
3. `delete p` via `Base*`: safe only with `virtual ~Base`; missing it = **UB** (not just "skips ~Derived").
4. `override` turns a **signature mismatch** (const/name/params) into a **compile error**, not a
   silent new non-overriding function.

## Q6 — `checked_max` (templates + exceptions) — 3/10

**Biggest issues:**
1. **`auto max;` is illegal AND wrong-headed.** No initializer for `auto`; and you can't seed a max
   with `0`/`INT_MIN` when the type is generic. Seed with the **first element**: `auto best = *first;`.
2. **Forgot to `throw`.** Spec = empty range → `throw std::invalid_argument(...)`. The whole point of
   the question; the `catch` in main can never fire without it. The empty-check must come **first**
   (you need ≥1 element to seed from).
3. **Signature vs call mismatch:** template takes `(It first, It last)` but called as `checked_max(words)`.
   Pass `words.begin(), words.end()` (or make it a range overload) — be consistent.
4. `for_each` + captured-by-ref accumulator is just a hand-rolled loop with extra steps; a plain
   `for (auto it = first; it != last; ++it)` is what "write the loop yourself" wants.

```cpp
template <typename It>
auto checked_max(It first, It last) {
    if (first == last) throw std::invalid_argument("empty range");
    auto best = *first;
    for (auto it = first; it != last; ++it) if (best < *it) best = *it;
    return best;
}
```

## Q7 — `char_counts` (std::map) — 8/10

**Function was perfect** (`++counts[c]` — `operator[]` value-inits to 0, then ++ → 1). Bugs in main:
1. **Looped over the function, not the result.** Stored `auto map = char_counts(s);` but wrote
   `for (... : char_counts)` — `char_counts` is the *function name*. Iterate the **variable** `map`.
2. **Structured binding needs `auto`:** `const auto& [key, value]`, not `const& [...]`. The `auto`
   is required — the compiler deduces each element's type through it.

```cpp
auto counts = char_counts(s);
for (const auto& [key, value] : counts)
    std::cout << key << ": " << value << "\n";
```

## Q8 — custom forward iterator — 5/10

**Traits + `operator*` + `operator++` were perfect.** Semantics broken:
1. **`operator==` must compare POSITIONS (the pointers), not values.** Wrote `*ptr == other.ptr`
   (int value vs pointer). Correct: `ptr == o.ptr`. Also never deref an `end()` iterator — `*ptr`
   at one-past-end is UB. (Pointer-vs-value, 3rd time.)
2. **`begin()` must point at the first element:** `Iterator(data)`, not `Iterator()` (no default ctor).
3. **`end()` is ONE-PAST-THE-LAST (`data + 4`), never `nullptr`.** With `nullptr`, `++ptr` never
   equals end → infinite loop / runs off the array. Half-open `[begin, end)`.

```cpp
bool operator==(const Iterator& o) const { return ptr == o.ptr; }
bool operator!=(const Iterator& o) const { return !(*this == o); }
Iterator begin() { return Iterator(data);     }
Iterator end()   { return Iterator(data + 4); }
```

## Q9 — `join` (strings, separator off-by-one) — 6/10

**Bug: trailing separator.** Loop did `s += n; s += sep;` after *every* element → `join({"a","b","c"})`
returns `"a, b, c, "`. Special-cased empty/single correctly, but broke the MAIN case.
**Lesson:** put the separator **before each element except the first** — then empty AND single fall
out for free, no special cases needed:

```cpp
std::string s;
for (size_t i = 0; i < parts.size(); ++i) {
    if (i > 0) s += sep;     // sep BETWEEN, not after
    s += parts[i];
}
return s;
```

## Q10 — lambda captures (conceptual) — 5.5/10

**A & D right. The two misses are two sides of one idea:**
- **B (dangling ref):** `return [&n](){...}` from a function captures local `n` **by reference**; `n`
  dies when the function returns → **dangling reference → UB** (NOT "always returns 1"). Fix = drop
  the `&` → `[n]` (lambda owns its own copy). For a real counter: `[n]() mutable { return ++n; }`.
- **C (mutable):** the lambda's **`operator()` is `const` by default**, so you can't assign to a
  by-value capture inside it → `x = x+1` does **NOT compile**. (The copy is a normal non-const
  member; it's the const call operator that blocks it.) `mutable` drops that `const`. Even then the
  OUTER `x` is untouched (mutates the lambda's own copy); the copy persists, so `g()` twice → 1, 2.

**Rule:** by value = snapshot at creation + const unless `mutable`. By ref = aliases original +
dangles if the original dies first.

## Q11 — Rule of 5 / copy-and-swap (`Buffer`) — 5/10

**Copy ctor was perfect.** Copy-and-swap *idea* right, execution bugs:
1. **Assignment returns `Buffer&`, NOT `Buffer*`.** (Return-type discipline — same slip as Q6.)
2. **Copy-assign must swap with `temp` (the fresh copy), not the source `other`.** Swapping with
   `other` ignores `temp` and mutates the const source. Pattern: `Buffer temp(other); swap(*this,temp);`
3. **Move params are `Buffer&&` — never `const Buffer&&`.** Can't steal from a const object.
4. **Inside these members call the friend `swap(...)`, never `std::swap` on the whole object** —
   generic `std::swap(*this,x)` is built ON the move ctor/assign, so calling it inside the move ctor
   **infinite-recurses**. NOT because "swap doesn't work on pointers" — the friend swap literally
   does `std::swap(a.data, b.data)` on the `int*` and that's totally fine (just swaps addresses).
   The friend swaps the *members*; the special members call the friend. Add `noexcept` to moves.
5. Self-check uses the **address** `if (this == &other)`, not `*this == other` (no `operator==`).

```cpp
Buffer& operator=(const Buffer& o){ Buffer t(o); swap(*this,t); return *this; }
Buffer(Buffer&& o) noexcept : len(0), data(nullptr) { swap(*this,o); }
Buffer& operator=(Buffer&& o) noexcept { swap(*this,o); return *this; }
```

## Q12 — `drop_lowest_average` (algorithm + numeric) — 6.5/10

**Got right:** `accumulate`, `*min_element` (iterator → deref, the pointer-vs-value win this time),
divisor `size()-1`.
1. **Cast placement = integer division.** `static_cast<double>((a)/(b))` truncates FIRST, then casts
   the dead int. Cast the **numerator**: `static_cast<double>(total - min) / (size()-1)`. Example hid
   it (270/3=90); `271/3` exposes it (got 90.0, want 90.33).
2. **Unguarded small inputs:** size 1 → divide by zero; size 0 → `*min_element` derefs `end()` (UB)
   AND `size()-1` is **unsigned underflow** (`size_t` 0-1 → ~1.8e19). Guard: `if (size()<2) throw`.

```cpp
if (scores.size() < 2) throw std::invalid_argument("need >= 2");
return static_cast<double>(total - minimum) / (scores.size() - 1);
```

## Q13 — polymorphism coding (`Circle : Shape`) — 7.5/10

**Mechanics all correct:** ctor chaining `Shape("circle")`, `override` used, **const signatures match**
(the trap), and **covariant return** `Circle* clone() const override` returning `new Circle(...)` — valid
and idiomatic (override may return a derived ptr where base returns `Shape*`).
1. `area()` body used `r` (member is `radius`) and `std::pi` (doesn't exist) → `3.14159 * radius * radius`.
   (`std::numbers::pi` from `<numbers>` is the real C++20 one.)
2. Left `main()` empty — was meant to drive it via a `Shape*` (virtual dispatch + `delete` both, no leak).

**Watch (from the main attempt):** `clone()` must build the DERIVED type `new Circle(*this)` — you
can't `new` an abstract base; drive a base pointer with `new Circle(...)` and call through it with
`->` (not `.`); delete BOTH pointers.

**Rule of Zero:** declare NONE of the 5 special members (dtor + copy/move ctor + copy/move assign);
ordinary/parameterized ctors are still fine. Exception: a polymorphic base declares `virtual ~Base`.

## Q14 — `Array<T>` class + member template — 8/10

**Member-template syntax PERFECT** (`template<typename Fn> void apply(Fn)` inside `template<typename T>
class`), throwing `operator[]` and RAII correct.
1. **`apply` mutation contract:** prompt wanted **in-place by reference** — `fn(buf[i])` with `fn`
   taking `T&`. Did the transform flavor `buf[i] = fn(i)` (passes the INDEX, lambda was `const int&`
   so couldn't mutate). In-place demo needs a captured counter: `arr.apply([&i](int& x){x=i*i;++i;});`.
2. **Member init order trap (not a bug here, but know it):** members init in DECLARATION order, not
   init-list order. Declared `buf` before `len` but init `len` first — safe only because `len` in
   `new T[len]` is the PARAMETER (shadows member). Declare `len` first; `-Wreorder` warns.
3. Minor: `s += i` appends a char with codepoint i, not digits → `std::to_string(i)`.

## Q15 — smart pointers (conceptual) — 6/10  ⚠️ weak area

**A & B solid.** Burn in:
- **A (unique_ptr):** non-copyable (copy ctor deleted — exclusive ownership, else double-free). `std::move`
  transfers: source → `nullptr`, target owns it.
- **B (shared_ptr count):** `1,2,1,1`. Object dies when `use_count` hits 0 (= when the LAST owner `p`
  dies/resets), not at an inner scope's `}`. A `nullptr`'d owner releases nothing on destruction.
- **C (CYCLE = LEAK, not dangling):** x↔y via `shared_ptr next` → when x,y leave scope each Node's
  count drops 2→1 (held by the other's `next`), **never 0 → never freed → leak**. Fix = **`weak_ptr`**
  for one link: it's a NON-OWNING observer, **doesn't bump the count**, so the cycle can hit 0. Use
  `.lock()` to access it (null if gone).
- **D (make_* vs new):** NOT "auto-deletes" (that's smart-ptr-vs-raw). Real: **(1) single allocation**
  (object + control block together vs two), **(2) exception-safe** (no leak window if an arg throws
  mid-expression).

---

## Recurring themes to watch
- **⚠️ Pointer vs. value (Q1, Q3, Q8 — 3×, your #1 leak):** a pointer is an ADDRESS. Comparing
  positions/null? use the pointer (`ptr == o.ptr`, `curr != nullptr`). Comparing data? deref (`*h`).
  Iterator `==` compares positions, never values; never deref an `end()` iterator.
- **⚠️ Return type discipline (Q6, Q11 — 2×):** match the signature exactly. Assignment operators
  return `T&` (not `T*`/by-value); a pointer-returning fn returns a pointer (not int).
- **`break`/advance vs `return`:** failing one attempt ≠ failing the whole search.
- **`const` correctness:** don't strip `const` off the parameters.
- **Integer division (Q4, Q12):** cast to `double` BEFORE dividing, not the result. `toupper` etc.
  take an `unsigned char`.
- **Unsigned underflow (Q12):** `container.size()` is unsigned; `size()-1` on an empty container
  wraps to a huge number. Guard the size first.
- **Empty/degenerate inputs (Q6, Q9, Q12):** empty range, size 1, divide-by-zero — guard before
  you index, deref `min_element`/`*first`, or divide.