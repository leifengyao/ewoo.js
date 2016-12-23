/*!
*******************************************************************************
 [ewoo.widget] [自定义组件]  
*******************************************************************************
  */
/////////////////////////////////对组件e-widgetd的处理///////////////////////////////////////////////////////////////
//根据组件类型及绑定参数，生成html的模版
// ewoo.widget = function(para) {
//     var arr = para.split(',');
//     var type = arr[0];
//     var storeName = arr[1];
//     var html = '';
//     switch (type) {
//         case 'grid':
//             html = ' <table border=1>\n\
// <tr e-each="@store.header" align="center\n\
// <td>{el.key}</td>        \n\
// </tr>\n\
//      <tr e-each="@store.items" align="center">';
//             html += ' <td>{el.index+1}</td>';
//             html += ' <td>{el.code}</td>';
//             html += ' <td>{el.name}</td>';
//             html += ' <td>{el.createTime}</td>';
//             html += ' <td>{el.updateTime}</td>';
//             html += ' <td>{el.memo}</td>';
//             html += ' <td></td>';
//             html += ' </tr></table>';

//             break;
//         default:
//             html = '无效的html';
//     }
//     html = html.replace(/@store/g, storeName);
//     return html;
// }
///////////////老式的组件/////////////////

