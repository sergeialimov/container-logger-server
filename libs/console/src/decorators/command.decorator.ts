import { applyDecorators, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

export const CoreCommandDecorator = DiscoveryService.createDecorator<boolean>();

export function Command (): ClassDecorator {
  return applyDecorators(
    Injectable(),
    CoreCommandDecorator(true),
  );
}
