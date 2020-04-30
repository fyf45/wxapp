const defaultComparator = function(a, b) {
  return a < b;
}
function quickSort(array, comparator) {
  if (array && array.length > 1) {
    let pivotIndex = Math.floor(array.length / 2);
    let pivot = array.splice(pivotIndex, 1);
    let left = [];
    let right = [];
    comparator = comparator || defaultComparator;
    for (let i = 0; i < array.length; i++) {
      if (comparator(array[i], pivot[0]))
        left.push(array[i]);
      else
        right.push(array[i]);
    }
    return quickSort(left, comparator).concat(pivot, quickSort(right, comparator));
  } else {
    return array;
  }
}
export {
  quickSort
};