interface BasicLogFields {
  '@timestamp'?: string;
  'log.level'?: string;
  'message'?: string;
  'service.name'?: string;
  // ... other known fields
}

type AdditionalLogFields = Record<string, unknown>;

export class LogDTO {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  environment: string;
  errorCode?: string;
  userId?: string;
  additionalFields: AdditionalLogFields;

  constructor (logData: BasicLogFields & AdditionalLogFields) {
    this.timestamp = logData['@timestamp'] ?? new Date().toISOString();
    this.level = logData['log.level'] ?? 'INFO';
    this.message = logData['message'] ?? '';
    this.service = logData['service.name'] ?? '';
    this.environment = ''; // Set based on your logic
    this.errorCode = typeof logData['errorCode'] === 'string' ? logData['errorCode'] : undefined;
    this.userId = typeof logData['userId'] === 'string' ? logData['userId'] : undefined;
    this.additionalFields = {};

    Object.keys(logData).forEach((key) => {
      if (!(key in this)) {
        this.additionalFields[key] = logData[key];
      }
    });
  }
}
