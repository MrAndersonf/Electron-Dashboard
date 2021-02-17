const icon = require(path.resolve(__dirname + "/../icons/index.js"));

module.exports = {
  processTableRow(pid, computer, script, status) {
    return `
        <tr>
            <td>${pid}</td>
            <td>${computer}</td>
            <td>${script}</td>
            <td>${status}</td>
            <td>
                <div class="actionButtomsSection">
                    <button class="customBtnAction">${icon.trash()}</button>
                    <button class="customBtnAction" onclick="play()">
                        ${icon.play()}
                    </button>
                    <button class="customBtnAction">${icon.pause()}</button>
                </div>
            </td>
        </tr>
        `;
  },
  loadingTableRow(pid, computer, script, status) {
    return `
        <tr>
            <td>${pid}</td>
            <td>${computer}</td>
            <td>${script}</td>
            <td id="status${pid}" >${status}</td>
        </tr>
        `;
  },
  sockets(pid, computer, script) {
    return `<tr>
    <td>${pid}</td>
    <td>${computer}</td>
    <td><div><select id="script_${pid}">${script}</select></div></td>
    <td><div><input id="instances_${pid}" style="border: transparent;width: 45px" type="number" value="0" min="0" step="1"/></div></td>
    <td>Aguardando</td>
    <td>
        <div class="actionButtomsSection">
            <button class="customBtnAction">${icon.trash()}</button>
            <button class="customBtnAction" onclick="event.preventDefault();activeScript('${pid}')">
                ${icon.play()}
            </button>
            <button class="customBtnAction">${icon.pause()}</button>
        </div>
    </td>
</tr>
        `;
  },
};
