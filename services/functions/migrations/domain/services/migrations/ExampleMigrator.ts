import { InvocationContext } from '@common/gateway/model/invocationContext';
import { lazyInject } from '@common/injection/decorator';
import { INJECTABLES } from '@common/injection/injectables';
import { TaskResult } from '@common/results/taskResult';
import { BankRepository } from '@functions/banks/domain/interfaces/bankRepository';
import { taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

class ExampleMigrator {
	@lazyInject(INJECTABLES.BankRepository)
	private bankRepository!: BankRepository;

	migrate(context: InvocationContext): TaskResult<void> {
		return pipe(
			this.bankRepository.list({ queryAll: true }, context),
			taskEither.chain((banks) =>
				taskEither.sequenceArray(
					banks.items.map((bank) =>
						// e.g. update banks to add a new field
						this.bankRepository.update(bank, context)
					)
				)
			),
			taskEither.map(() => void 0)
		);
	}
}

export const exampleMigrator = new ExampleMigrator();
