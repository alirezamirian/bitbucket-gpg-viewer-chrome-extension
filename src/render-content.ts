export const renderContent = ({ fileContent }, rootElement: HTMLElement) => {
  // TODO: use CodeMirror and existing bitbucket.xxx requirejs modules to render the original
  //  bitbucket file content view.
  rootElement.innerHTML = `<pre style="padding: 10px;">${fileContent}</pre>`;
};
