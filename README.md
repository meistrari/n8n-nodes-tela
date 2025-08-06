# n8n-nodes-tela

This is an n8n community node that provides integration with the Tela API. It allows you to interact with Tela projects and canvases in your n8n workflows.

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-tela` as the package name
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

After installing the node, you can use it like any other node in your workflows.

### Manual Installation

To install it globally (for self-hosted n8n instances):

```bash
npm install n8n-nodes-tela
```

For Docker installations, follow the [custom nodes guide](https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/).

## Configuration

1. Create a new credential of type "Tela API"
2. Enter your Tela API key (you can find this in your Tela dashboard)
3. Test the connection to verify it works

## Operations

This node supports the following operations:

### Tela

- **Execute Canvas**: Run a canvas with dynamic variables and get results
- **Get Projects**: List all available projects
- **Get Canvases**: List canvases for a specific project

## Node Reference

### Credentials

- **API Key**: Your Tela API key from your dashboard

### Parameters

- **Project**: Select the project containing your canvas
- **Canvas**: Select the canvas to execute
- **Variables**: Dynamic fields based on your canvas configuration

## Usage

1. Add the Tela node to your workflow
2. Configure your Tela API credentials
3. Select a project and canvas
4. Configure any required variables
5. Execute the workflow

## Compatibility

- Requires n8n version 0.174.0 or later
- Compatible with n8n cloud and self-hosted instances

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Tela API documentation](https://docs.tela.com)

## Support

For bug reports and feature requests, please [create an issue](https://github.com/yourusername/n8n-nodes-tela/issues).

## License

[MIT](LICENSE.md)
