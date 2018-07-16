import React, { Component } from "react";

import { withRouter } from "react-router";

import {
  Col,
  Row,
  Form,
  FormGroup,
  PasswordInput,
  Label,
  FormText,
  Button
} from "design-react-kit";

const { localStorage } = window;

import "./Login.css";

class Login extends Component {
  state = {
    serviceKey: ""
  };

  onPasswordChange = ({ target: { value } }) => {
    this.setState({
      serviceKey: value
    });
  };

  onStoreCredentials = e => {
    e.preventDefault();

    const { serviceKey } = this.state;
    
    if (!!serviceKey) {
      localStorage.setItem("serviceKey", serviceKey);

      this.goHome();
    }
  };

  goHome = () => {
    const { history } = this.props;
    const location = {
      pathname: "/"
    };
    history.replace(location);
  }

  render() {
    return (
      <section className="container login--container d-flex justify-content-center align-items-center">
        <Row className="w-40">
          <Col lg="12">
            <Form className="form-row">
              <Col lg="11">
                <FormGroup>
                  <PasswordInput id="login--serviceKey" onChange={this.onPasswordChange} />
                  <Label for="login--serviceKey">API Key</Label>
                  <FormText color="muted">
                    inserisci le credenziali per il tuo servizio
                  </FormText>
                </FormGroup>
              </Col>
              <Col lg="1">
                <Button
                  color="primary"
                  className="mt-3 ml-5"
                  onClick={this.onStoreCredentials}
                >
                  Invia
                </Button>
              </Col>
            </Form>
          </Col>
        </Row>
      </section>
    );
  }
}

export default withRouter(Login);
