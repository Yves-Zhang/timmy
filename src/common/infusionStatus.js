import _ from 'lodash';

function checkStatus(item) {
  const itemTemp = Object.assign({}, item);
  switch (item.infusion_status) {
    case 'I':
      itemTemp.tagType = 'primary';
      itemTemp.statusText = '输液中';
      break;
    case 'S':
      itemTemp.tagType = 'danger';
      itemTemp.statusText = '已中止';
      break;
    case 'P':
      itemTemp.tagType = 'warning';
      itemTemp.statusText = '已暂停';
      break;
    case 'B':
      itemTemp.tagType = '';
      itemTemp.statusText = '开始输液';
      break;
    case 'F':
      itemTemp.tagType = 'success';
      itemTemp.statusText = '已输完';
      break;
    case 'L':
      itemTemp.tagType = 'gray';
      itemTemp.statusText = '已离开';
      break;
    default:
      itemTemp.tagType = 'gray';
      itemTemp.statusText = '';
      break;
  }
  return itemTemp;
}

export default function (data) {
  if (Array.isArray(data)) {
    return data.map(item => checkStatus(item));
  }

  if (!Array.isArray(data) && _.isObject(data)) {
    return checkStatus(data);
  }

  return null;
}
