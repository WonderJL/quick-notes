
# Solidity Data Structure Patterns: Circular Buffer, Deque, and Priority Queue

In Solidity, specialized data structures like circular buffers, double-ended queues, and priority queues enable efficient handling of various data patterns. This guide provides examples and technical insights for implementing these structures.

## Key Data Structure Patterns

### A. Circular Buffer Implementation

Circular buffers provide an efficient way to handle fixed-size First-In-First-Out (FIFO) operations.

#### Example

```solidity
// Efficient circular buffer for fixed-size FIFO operations
contract CircularBuffer {
    struct Buffer {
        mapping(uint256 => uint256) data;
        uint256 first;  // First element index
        uint256 length; // Current buffer length
        uint256 maxSize;// Maximum buffer size
    }
    
    Buffer private buffer;
    
    constructor(uint256 _maxSize) {
        buffer.maxSize = _maxSize;
    }
    
    function push(uint256 value) external {
        uint256 index = (buffer.first + buffer.length) % buffer.maxSize;
        buffer.data[index] = value;
        
        if (buffer.length < buffer.maxSize) {
            buffer.length++;
        } else {
            // Overwrite oldest element
            buffer.first = (buffer.first + 1) % buffer.maxSize;
        }
    }
    
    function get(uint256 index) external view returns (uint256) {
        require(index < buffer.length, "Index out of bounds");
        return buffer.data[(buffer.first + index) % buffer.maxSize];
    }
    
    function length() external view returns (uint256) {
        return buffer.length;
    }
}
```

#### Explanation

Circular buffers maintain a constant memory footprint by overwriting the oldest element once the maximum size is reached, making them ideal for fixed-size FIFO scenarios.

---

### B. Double-Ended Queue (Deque) Pattern

Double-ended queues allow adding and removing elements from both ends, offering flexibility in managing data sequences.

#### Example

```solidity
contract Deque {
    struct DoubleEndedQueue {
        mapping(uint256 => uint256) elements;
        uint256 first;
        uint256 last;
        uint256 length;
    }
    
    DoubleEndedQueue private deque;
    
    function pushFront(uint256 value) external {
        if (deque.length == 0) {
            deque.elements[0] = value;
            deque.last = 0;
        } else {
            require(deque.first > 0, "Queue full at front");
            deque.first--;
            deque.elements[deque.first] = value;
        }
        deque.length++;
    }
    
    function pushBack(uint256 value) external {
        if (deque.length == 0) {
            deque.elements[0] = value;
            deque.first = 0;
        } else {
            deque.last++;
            deque.elements[deque.last] = value;
        }
        deque.length++;
    }
    
    function popFront() external returns (uint256) {
        require(deque.length > 0, "Queue empty");
        uint256 value = deque.elements[deque.first];
        delete deque.elements[deque.first];
        deque.first++;
        deque.length--;
        return value;
    }
    
    function popBack() external returns (uint256) {
        require(deque.length > 0, "Queue empty");
        uint256 value = deque.elements[deque.last];
        delete deque.elements[deque.last];
        deque.last--;
        deque.length--;
        return value;
    }
}
```

#### Explanation

This deque implementation supports both front and back operations, making it versatile but requiring careful index management.

---

### C. Priority Queue Implementation

Priority queues order elements by priority, typically requiring rebalancing for each insertion.

#### Example

```solidity
contract PriorityQueue {
    struct Node {
        uint256 value;
        uint256 priority;
    }
    
    mapping(uint256 => Node) private heap;
    uint256 public size;
    
    function parent(uint256 pos) private pure returns (uint256) {
        return (pos - 1) / 2;
    }
    
    function leftChild(uint256 pos) private pure returns (uint256) {
        return (2 * pos) + 1;
    }
    
    function rightChild(uint256 pos) private pure returns (uint256) {
        return (2 * pos) + 2;
    }
    
    function push(uint256 value, uint256 priority) external {
        heap[size] = Node(value, priority);
        uint256 current = size;
        
        while (current > 0 && 
               heap[current].priority > heap[parent(current)].priority) {
            // Swap with parent
            Node memory temp = heap[current];
            heap[current] = heap[parent(current)];
            heap[parent(current)] = temp;
            current = parent(current);
        }
        size++;
    }
    
    function pop() external returns (uint256) {
        require(size > 0, "Queue empty");
        
        uint256 popped = heap[0].value;
        heap[0] = heap[size - 1];
        size--;
        
        uint256 pos = 0;
        while (true) {
            uint256 maxPos = pos;
            uint256 left = leftChild(pos);
            uint256 right = rightChild(pos);
            
            if (left < size && 
                heap[left].priority > heap[maxPos].priority) {
                maxPos = left;
            }
            if (right < size && 
                heap[right].priority > heap[maxPos].priority) {
                maxPos = right;
            }
            
            if (maxPos == pos) break;
            
            // Swap with larger child
            Node memory temp = heap[pos];
            heap[pos] = heap[maxPos];
            heap[maxPos] = temp;
            pos = maxPos;
        }
        
        return popped;
    }
}
```

#### Explanation

The priority queue orders elements by priority using a binary heap. It supports efficient removal of the highest-priority element but can be gas-intensive for large datasets.

---

## Technical Considerations

- **Circular Buffers:** Ideal for fixed-size FIFO data handling with low memory usage.
- **Priority Queues:** May incur high gas costs for large datasets due to rebalancing operations.
- **Deques:** Flexible but require careful management of indices to avoid overflow and underflow.
- **Overflow Protection:** Each of these patterns requires precautions to prevent index overflows.

---

## References

1. [Solidity Documentation on Data Structures](https://docs.soliditylang.org/en/latest/types.html)
2. [Efficient Data Structure Implementation in Ethereum](https://ethereum.org/en/developers/docs/)

---

By applying these data structures, Solidity developers can manage data sequences more efficiently, leveraging FIFO, LIFO, and priority patterns as required.
