interface BasicLogFields {
  timestamp?: string;
  level?: string;
  message?: string;
  service?: string;

}

type AdditionalLogFields = Record<string, unknown>;

export class LogDTO {
  timestamp: string;
  level: string;
  message: string;
  serviceName: string;  // Separate field for service name
  serviceVersion: string;  // Separate field for service version
  environment: string;
  errorCode?: string;
  userId?: string;
  additionalFields: AdditionalLogFields;

  constructor (logData: BasicLogFields & AdditionalLogFields) {
    this.timestamp = logData.timestamp ?? new Date().toISOString();
    this.level = logData.level ?? 'INFO';
    this.message = logData.message ?? '';

    // Splitting the service field into name and version
    const [ serviceName, serviceVersion ] = (logData.service ?? '').split(':');
    this.serviceName = serviceName ?? '';
    this.serviceVersion = serviceVersion ?? '';

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
