const dummyRequests = [
  {
    id: "req_001",
    businessName: "Tech Innovators LK",
    phoneNumber: "+94 77 123 4567",
    email: "contact@innovators.lk",
    avatarUrl: "/static/images/avatar/1.jpg",
    paymentReceiptUrl: "/receipts/payment_001.pdf",
    requestedStalls: [
      { stallId: "A1", genre: "IT" },
      { stallId: "A2", genre: "IT" },
    ],
  },
  {
    id: "req_002",
    businessName: "Office Essentials Hub",
    phoneNumber: "+94 71 987 6543",
    email: "sales@officeessentials.com",
    avatarUrl: "/static/images/avatar/2.jpg",
    paymentReceiptUrl: "/receipts/payment_002.png",
    requestedStalls: [
      { stallId: "B1", genre: "stationary" },
      { stallId: "B2", genre: "exercise books" },
    ],
  },
  {
    id: "req_003",
    businessName: "Byte World Computers",
    phoneNumber: "+94 76 222 3344",
    email: "info@byteworld.lk",
    avatarUrl: "/static/images/avatar/3.jpg",
    paymentReceiptUrl: "/receipts/payment_003.jpg",
    requestedStalls: [
      { stallId: "C1", genre: "IT" },
      { stallId: "C2", genre: "IT" },
      { stallId: "C3", genre: "stationary" },
    ],
  },
  {
    id: "req_004",
    businessName: "Scholar Supplies",
    phoneNumber: "+94 70 555 7788",
    email: "support@scholarsupplies.com",
    avatarUrl: "/static/images/avatar/4.jpg",
    paymentReceiptUrl: "/receipts/payment_004.pdf",
    requestedStalls: [{ stallId: "D1", genre: "exercise books" }],
  },
];
export default dummyRequests;
