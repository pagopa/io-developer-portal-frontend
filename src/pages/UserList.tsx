import React, { Component } from "react";

import { WithNamespaces, withNamespaces } from "react-i18next";

import { Link } from "react-router-dom";

import { getFromBackend } from "../utils/backend";

import FaUser from "react-icons/lib/fa/user";
import { UserDataList } from "../../generated/definitions/backend/UserDataList";

type UserListState = {
  users: UserDataList;
};

class UserList extends Component<WithNamespaces, UserListState> {
  public state: UserListState = {
    users: { items: [], length: 0 }
  };

  public componentDidMount = async () => {
    if (window.localStorage.hasOwnProperty("USER_SUBSCRIPTIONS")) {
      window.localStorage.removeItem("USER_SUBSCRIPTIONS");
    }
    const users: UserDataList = await getFromBackend<UserDataList>({
      path: "users"
    });
    this.setState({ users });
  };

  public render() {
    const { users } = this.state;
    const { t } = this.props;

    return (
      <div className="mt-4 mr-4 ml-4 pt-5 pr-5 pl-5">
        <table className="table mb-0 rounded">
          <thead>
            <tr>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">
                  {t("profile")}
                </span>
              </th>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">
                  {t("name")}
                </span>
              </th>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">
                  {t("surname")}
                </span>
              </th>
              <th className="border-0">
                <span className="text-uppercase font-weight-normal">
                  {t("email")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.items &&
              users.items.map(u => (
                <tr key={u.email}>
                  <td>
                    {u.email && (
                      <Link
                        className="large list-item"
                        to={{ pathname: `/profile/${btoa(u.email)}` }}
                      >
                        <FaUser />
                      </Link>
                    )}
                  </td>
                  <td>{u.firstName}</td>
                  <td>{u.lastName}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withNamespaces("users")(UserList);
