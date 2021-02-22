module.exports = {
  validate(inputs) {
    let focused = false;

    inputs.forEach((input) => {
      if (input.val() === "" && focused != true) {
        this.isInvalid(input);
        focused = true;
        input.trigger("focus");
      } else if (input.val() === "" && focused == true) {
        this.isInvalid(input);
      } else {
        this.isValid(input);
      }
    });
    return focused;
  },
  isInvalid(target) {
    target.removeClass().addClass("form-control is-invalid");
  },
  isValid(target) {
    target.removeClass().addClass("form-control is-valid");
  },
};
