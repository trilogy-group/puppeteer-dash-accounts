class ResponseObject {
  constructor(success, code, message, payload = null) {
    this.success = success;
    this.statusCode = code;
    this.message = message;
    this.payload = payload;
  }

  toString() {
    return JSON.stringify({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      payload: String(this.payload),
    });
  }

  getResult() {
    return {
      statusCode: 200,
      body: this.toString(),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}

module.exports = ResponseObject;
