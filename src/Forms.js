import React, { Component } from 'react';

export function formField(WrappedComponent) {
  class WrappedFormField extends Component {
    state = {
      value: '',
      errorMessage: null,
    }

    componentWillMount() {
      this.context.register(this.props.name);
    }

    handleChange(val) {
      this.setState({
        value: val
      }, () => {
        this.runValidators();
      });
    }

    runValidators() {
      // TODO: Cancel any existing in-flight validation...
      // TODO: Add optional throttling
      // TODO: This runs all validators, could be configured to short circuit instead

      Promise.all(this.props.validators.map((validator) => validator.fn(this.state.value))).then((results) => {
        for (let idx = 0; idx < results.length; idx += 1) {
          if (!results[idx]) {
            const failedValidator = this.props.validators[idx];
            this.handleFailedValidator(failedValidator);
            return;
          }
        }

        this.handleValid();
      }, (err) => {
        // Handle weird error
        console.error('error validating', err);
      });
    }

    handleValid() {
      this.setState({
        errorMessage: null,
      });

      this.context.onValid(this.props.name);
    }

    handleFailedValidator(validator) {
      const msg = validator.message;
      this.setState({
        errorMessage: msg,
      });
      this.context.onInvalid(this.props.name);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          errorMessage={this.state.errorMessage}
          onChange={this.handleChange.bind(this)}
          value={this.state.value} />
      );
    }
  }

  WrappedFormField.contextTypes = {
    onValid: React.PropTypes.func.isRequired,
    onInvalid: React.PropTypes.func.isRequired,
    register: React.PropTypes.func.isRequired,
    fields: React.PropTypes.any,
  };

  WrappedFormField.propTypes = Object.assign({
    validators: React.PropTypes.arrayOf(React.PropTypes.any),
    name: React.PropTypes.string.isRequired,
  }, WrappedFormField.propTypes);

  return WrappedFormField;
}

export class Form extends Component {
  fields = {};

  valid = false;

  getChildContext() {
    return {
      onValid: this.handleFieldValid.bind(this),
      onInvalid: this.handleFieldInvalid.bind(this),
      register: this.registerField.bind(this),
    };
  }

  registerField(name) {
    this.fields[name] = false;
  }

  handleFieldValid(name) {
    this.fields[name] = true;
    this.updateValidity();
  }

  handleFieldInvalid(name) {
    this.fields[name] = false;
    this.updateValidity();
  }

  updateValidity() {
    const isValid = Object.keys(this.fields).every((key) => this.fields[key] === true);

    if (this.valid && !isValid) {
      this.props.onInvalid();
    } else if (!this.valid && isValid) {
      this.props.onValid();
    }

    this.valid = isValid;
  }

  handleSubmit(evt) {
    // TODO: Don't allow submit of invalid form
    evt.preventDefault();
    this.props.onSubmit();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.props.children}
      </form>
    )
  }
}

Form.childContextTypes = {
  onValid: React.PropTypes.func.isRequired,
  onInvalid: React.PropTypes.func.isRequired,
  register: React.PropTypes.func.isRequired,
  fields: React.PropTypes.any,
};

Form.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
  onValid: React.PropTypes.func.isRequired,
  onInvalid: React.PropTypes.func.isRequired,
};
