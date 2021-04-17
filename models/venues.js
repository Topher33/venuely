import { Model, PartitionKey, DynamoStore } from '@shiftcoders/dynamo-easy'

@Model()
export class Venue {
  @PartitionKey()
  Id: string
  Category: string
}
