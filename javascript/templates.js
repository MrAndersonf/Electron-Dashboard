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
    return `<tr id="remove${pid}">
    <td>${pid}</td>
    <td>${computer}</td>
    <td><div><select id="script_${pid}">${script}</select></div></td>
    <td><div><input id="instances_${pid}" style="border: transparent;width: 45px" type="number" value="0" min="0" step="1"/></div></td>
    <td id="pid_status${pid}">Aguardando</td>
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
  connectedSockets(target, list) {
    let scripstList = "";
    list.scripts.forEach((script) => {
      scripstList += `<option value="${script.folder}">${script.folder}</option>`;
    });
    target.append(
      this.sockets(list.id, list.computer, scripstList, "Aguardando")
    );
  },
  installScriptOnCliet(target, list, file) {
    let computers = `<option value="all">Selecione</option>`;
    target.children().remove();
    list.forEach((client, i) => {
      computers += `<option value="${client.id}">${client.computer}</option>`;
      target.append(
        this.loadingTableRow(client.id, client.computer, file, "Executando")
      );
    });
  },

  Sending(target) {
    target.children().remove();
    let messagesToDisplay = [
      "Enviando .",
      "Enviando ..",
      "Enviando ...",
      "Enviando ....",
    ];
    let selectIndex = 0;
    return setInterval(() => {
      target.text(messagesToDisplay[selectIndex]);
      selectIndex++;
      if (selectIndex > 3) selectIndex = 0;
    }, 700);
  },
  Recieving(target) {
    target.children().remove();
    let messagesToDisplay = [
      "Recebendo .",
      "Recebendo ..",
      "Recebendo ...",
      "Recebendo ....",
    ];
    let selectIndex = 0;
    return setInterval(() => {
      target.text(messagesToDisplay[selectIndex]);
      selectIndex++;
      if (selectIndex > 3) selectIndex = 0;
    }, 700);
  },
};
