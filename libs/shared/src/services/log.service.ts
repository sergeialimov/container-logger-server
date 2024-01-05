import { Injectable } from '@nestjs/common';

import { LogDTO } from '../dtos/log.dto';

@Injectable()
export class LogService {
  public processLogs (rawLogs: (string | object)[]): LogDTO[] {
    return rawLogs
      .filter((log) => log) // Filter out falsy values (like empty strings, null, undefined)
      .map((log) => this.transformLogToDTO(log))
      .filter((dto): dto is LogDTO => dto !== undefined); // Type guard to filter out undefined values
  }

  public transformLogToDTO (logInput: string | object): LogDTO | undefined {
    try {
      let logData;
      if (typeof logInput === 'string') {
        // Skip Docker's log header if present (first 8 bytes)
        const cleanedLogInput = logInput.substring(0, 8).match(/[\{[]/) ? logInput : logInput.substring(8);
        logData = JSON.parse(cleanedLogInput);
      } else if (typeof logInput === 'object' && logInput !== null) {
        // Use the object directly
        logData = logInput;
      } else {
        console.error('Unexpected log format:', logInput);
        return undefined;
      }
      return new LogDTO(logData);
    } catch (error) {
      console.error('Error processing log entry:', error);
      return undefined;
    }
  }
}
