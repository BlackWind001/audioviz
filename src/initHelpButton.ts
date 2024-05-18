
export default function initHelpButton () {
  const helpButton = document.querySelector('button.help-button');
  const closeButton = document.querySelector('button.close-button');
  const helpDialog = document.querySelector('div.help-dialog');

  if (!helpButton || !closeButton || !helpDialog) {
    return;
  }

  const showHelpDialog = () => {
    helpDialog.classList.remove('hide');
    helpDialog.classList.add('show');
  }

  const hideHelpDialog = () => {
    helpDialog.classList.remove('show');
    helpDialog.classList.add('hide');
  }

  const handlePropagation = (e: Event) => {
    e.stopPropagation();
  }

  helpButton.addEventListener('click', () => {
    const isDialogVisible = !helpDialog.classList.contains('hide');

    if (isDialogVisible) {
      hideHelpDialog();
    }
    else {
      showHelpDialog();
    }

  });

  closeButton.addEventListener('click', hideHelpDialog);

  helpDialog.addEventListener('touchend', handlePropagation);
  helpDialog.addEventListener('touchmove', handlePropagation);

}
