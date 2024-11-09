
# Big O Notation - Study Notes

**Purpose**: Understanding Big O notation is crucial for assessing the efficiency of algorithms, particularly in terms of time and space complexity.

---

## Table of Contents

1. [Introduction to Big O Notation](#introduction-to-big-o-notation)
2. [Common Big O Complexities](#common-big-o-complexities)
3. [Merge Sort as an O(n log n) Example](#merge-sort-as-an-on-log-n-example)
4. [Why Merge Sort is O(n log n)](#why-merge-sort-is-on-log-n)
5. [References](#references)

---

## 1. Introduction to Big O Notation

Big O notation describes the worst-case or average time complexity of an algorithm as the input size grows. This notation helps engineers and developers understand how algorithms will perform as data scales.

- **Notation Format**: O(f(n)), where `f(n)` represents how runtime grows with input size `n`.
- **Goal**: Identifying inefficiencies and ensuring optimal algorithm selection.

---

## 2. Common Big O Complexities

Below are common complexities, ordered from most efficient to least efficient:

1. **O(1) - Constant Time**  
   - **Description**: Execution time does not depend on input size.
   - **Example**: Accessing an element in an array by index.

2. **O(log n) - Logarithmic Time**  
   - **Description**: Execution time grows very slowly as input size increases.
   - **Example**: Binary search.

3. **O(n) - Linear Time**  
   - **Description**: Execution time grows directly with input size.
   - **Example**: Iterating through an array.

4. **O(n log n) - Linearithmic Time**  
   - **Description**: Common in efficient sorting algorithms; manageable for large inputs.
   - **Example**: Merge sort.

5. **O(n^2) - Quadratic Time**  
   - **Description**: Execution time grows rapidly with input size, typically in nested loops.
   - **Example**: Bubble sort.

6. **O(2^n) - Exponential Time**  
   - **Description**: Execution time doubles with each additional input, often in recursive solutions.
   - **Example**: Recursive Fibonacci.

7. **O(n!) - Factorial Time**  
   - **Description**: Extremely inefficient for large inputs.
   - **Example**: Generating all permutations of a set.

---

## 3. Merge Sort as an O(n log n) Example

### Code Example
```javascript
function mergeSort(array) {
    if (array.length <= 1) return array;

    const mid = Math.floor(array.length / 2);
    const left = mergeSort(array.slice(0, mid));
    const right = mergeSort(array.slice(mid));

    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}
```
- **Explanation**: The `mergeSort` function recursively splits the array in half, sorting each half and merging them.

---

## 4. Why Merge Sort is O(n log n)

1. **Recursive Splitting (log n)**  
   - The array is halved in each recursive call until each part has one element.
   - The number of splits required to reach arrays of length 1 is `log n`.

2. **Merging (n)**  
   - At each level of recursion, all elements are merged, which requires `O(n)` time.

3. **Total Complexity**  
   - Since there are `log n` levels and each requires `O(n)` merging time, the complexity is `O(n log n)`.

**Example Walkthrough** (for an 8-element array):
- Level 1: Split into halves
- Level 2: Split further until single elements remain
- Final: Merge pairs upwards to form a sorted array, confirming `O(n log n)` complexity.

---

## 5. References

- [Big O Cheat Sheet](https://www.bigocheatsheet.com/)
- [Merge Sort Algorithm Explanation](https://www.geeksforgeeks.org/merge-sort/)
- [Understanding Big O Notation](https://www.freecodecamp.org/news/big-o-notation-explained-with-examples/)

---

**Note**: This document is intended as a quick reference to grasp the basics and intricacies of Big O notation and how it applies to algorithm performance.
