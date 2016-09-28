import React, { Component } from 'react';

import {Form, formField} from './Forms';

const goals = trimLines(`
  /**
   * Goals
   * - [x] Create custom validators with customizable error messages - don't be locked into specific messages
   * - [x] Async validation with promises
   * - [x] Run validation per field on keystroke with throttle
   * - [x] *Display* validation on blur after initial input only
   * - [x] Have way to determine if form as a whole is (in)valid given all of its fields
   * - [ ] Have way to manually update fields with errors from submission
   *       (this is fucking hard to do properly)
   * - [ ] Have way to submit form fields
   *   - [ ] Move form field state into form context instead of in field state (value, error message?)
   *      - Form has to be source of truth for field state because it's needed for submission, otherwise you'd have to introspect into
   *        child fields (as formsy-react does) which is generally considered bad practice.
   */
`);

/**
 * This is a customized field that uses formField as a higher-order component.
 *
 * It handles creating the actual input and wrapper for this field. It also handles hiding any active error while focused.
 */
class _Field extends Component {
  static get defaultProps() {
    return {
      type: 'text'
    };
  }

  state = {
    focused: false,
  }

  handleFocus() {
    this.setState({
      focused: true,
    });
  }

  handleBlur() {
    this.setState({
      focused: false,
    });
  }

  renderError() {
    if (this.state.focused) {
      // If we're focused, don't display error since user is actively updating
      return null;
    }

    if (!this.props.errorMessage) {
      return null;
    }

    return (
      <div className="field--error">
        {this.props.errorMessage}
      </div>
    );
  }

  render() {
    return (
      <div className="field">
        <label>
          {this.props.label}
          <input
            type={this.props.type}
            onChange={(e) => this.props.onChange(e.target.value)}
            onFocus={this.handleFocus.bind(this)}
            onBlur={this.handleBlur.bind(this)}
            value={this.props.value}
            />
        </label>

        {this.renderError()}
      </div>
    )
  }
}

_Field.propTypes = {
  label: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
};

const Field = formField(_Field);

const emailValidators = [{
  fn: (email) => {
    return /@/.test(email);
  },
  message: 'Invalid email address'
}, {
  fn: (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'harry@example.com') {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 200);
    });
  },
  message: 'Email address is already taken.'
}];

const passwordValidators = [{
  fn: (password) => {
    return password.length >= 8;
  },
  message: 'Minimum 8 characters.'
}];

// class _Form extends Component {
//   render() {
//   }
// }

// const Form = createForm(_Form);

class App extends Component {
  state = {
    valid: false,
  }

  handleSubmit(fields) {
    console.log(fields);
  }

  handleValid() {
    this.setState({
      valid: true,
    });
  }

  handleInvalid() {
    this.setState({
      valid: false,
    });
  }

  render() {
    return (
      <div className="App">
        <pre>
          {goals}
        </pre>

        <Form onSubmit={this.handleSubmit} onValid={this.handleValid.bind(this)} onInvalid={this.handleInvalid.bind(this)}>
          <Field
            name="email"
            validators={emailValidators}
            label="Email" />

          <Field
            name="password"
            type="password"
            validators={passwordValidators}
            label="Password" />

          <button type="submit" disabled={!this.state.valid}>Submit</button>
        </Form>
      </div>
    );
  }
}

export default App;

function trimLines(string) {
  return string.split('\n').map((line) => line.replace(/^\s+/, '')).join('\n').trim();
}