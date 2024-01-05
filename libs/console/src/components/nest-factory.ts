// This import is mandatory for defining the Reflect.getMetadata
// Nested imports (e.g. '@nestjs/core/nest-factory') can not be used properly
// without importing index module (e.g. '@nestjs/core')
import '@nestjs/core';

import { Module } from '@nestjs/core/injector/module';
import { NestFactoryStatic as BaseNestFactoryStatic } from '@nestjs/core/nest-factory';

import { NestConsoleApplicationOptions , NestConsoleApplication } from './nest-console.application';
import { NestConsoleApplicationInterface } from '../interfaces';

class NestFactoryStatic extends BaseNestFactoryStatic {
  public async createConsoleApplication (
    module: typeof Module,
    options?: NestConsoleApplicationOptions,
  ): Promise<NestConsoleApplicationInterface> {
    const applicationContext = await this.createApplicationContext(module, options);

    applicationContext.enableShutdownHooks();

    return new NestConsoleApplication(applicationContext, options);
  }
}

export const NestFactory = new NestFactoryStatic();
