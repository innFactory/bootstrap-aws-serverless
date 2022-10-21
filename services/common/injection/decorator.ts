import getDecorators from 'inversify-inject-decorators';
import { injector } from './inversify.config';

export const { lazyInject } = getDecorators(injector);
