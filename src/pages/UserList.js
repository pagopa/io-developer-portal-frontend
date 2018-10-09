import React, { Component } from "react";
import { getFromBackend } from "../utils/backend";
import { Link } from "react-router-dom";
import FaUser from "react-icons/lib/fa/user";

const { localStorage } = window;

export default class UserList extends Component {
  state = {
    userToken: localStorage.getItem("userToken"),
    users: { items: [], length: 0 }
  };

  componentDidMount = async () => {
    const self = this;
    const users = await getFromBackend({
      path:
        "users"
    });
    this.setState({ users });
  }

  render() {
    return (
      <table className="table mb-0 rounded">
        <thead>
          <tr>
            <th className="border-0">
              <span className="text-uppercase font-weight-normal">Profilo</span>
            </th>
            <th className="border-0">
              <span className="text-uppercase font-weight-normal">Nome</span>
            </th>
            <th className="border-0">
              <span className="text-uppercase font-weight-normal">Cognome</span>
            </th>
            <th className="border-0">
              <span className="text-uppercase font-weight-normal">Email</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.state.users.items.map(u =>
            <tr key={u.email}>
              <td>
                <Link
                  className="large list-item"
                  to={{ pathname: `/profile/${btoa(u.email)}` }}
                >
                  <FaUser />
                </Link>
              </td>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.email}</td>
            </tr>)}
        </tbody>
      </table>)
  }
}