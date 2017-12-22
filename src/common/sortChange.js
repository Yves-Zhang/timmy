import _ from 'lodash';

export function sortChange(dataSorce, prop, order, chunkSize) {
  const _order = order.indexOf('desc') > -1 ? 'desc' : 'asc';
  return _.chunk(_.orderBy(dataSorce, [prop], [_order]), chunkSize);
}
