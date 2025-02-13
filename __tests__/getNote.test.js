const { getNote } = require("../handler");
const AWS = require("aws-sdk-mock");

describe("getNote Lambda Function", () => {
  beforeAll(() => {
    AWS.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      console.log("Mocking DynamoDB GET Request for Note ID:", params.Key.noteId);
      if (params.Key.noteId === "123") {
        callback(null, { Item: { noteId: "123", title: "Test Note", content: "Test Content" } });
      } else {
        callback(null, {}); // Empty object mimics missing note, causing a 404.
      }
    });
  });

  afterAll(() => {
    AWS.restore("DynamoDB.DocumentClient");
  });

  it("should return a note when noteId is found", async () => {
    const event = { pathParameters: { id: "123" } };
    const response = await getNote(event);
    console.log("Response from getNote (Expected 200):", response);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).noteId).toBe("123");
  });

  it("should return 404 when noteId is not found", async () => {
    const event = { pathParameters: { id: "999" } };
    const response = await getNote(event);
    console.log("Response from getNote (Expected 404):", response);
    expect(response.statusCode).toBe(404);
  });
});
