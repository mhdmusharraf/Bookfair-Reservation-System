// data/dummyStalls.js

const statuses = ["AVAILABLE", "REQUESTED", "ACCEPTED"];
const sizes = ["SMALL", "MEDIUM", "LARGE"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDummyStalls() {
  const stalls = [];
  let id = 1;

  // Each hall with its stall capacity
  const capacities = {
    N: 8,
    M: 6,
    L: 6,
    P: 5,
    Q: 5,
    R: 8,
    K: 10,
    J: 10,
    A: 24,
    B: 24,
    C: 12,
    D: 12,
    H: 20,
  };

  for (const [hall_code, capacity] of Object.entries(capacities)) {
    for (let i = 0; i < capacity; i++) {
      stalls.push({
        id, // numeric primary key
        stall_code: `${hall_code}-${i + 1}`, // stall code like "A-1"
        hall_code,
        size: randomItem(sizes),
        status: randomItem(statuses),
        width: 10,
        height: 10,
        price: 10000 + Math.floor(Math.random() * 5000),
        booked_by: null, // or user_id when accepted
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      id++;
    }
  }

  return stalls;
}

const dummyStalls = generateDummyStalls();

export default dummyStalls;
