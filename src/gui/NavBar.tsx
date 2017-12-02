import * as React from "react";


export interface Props {
  onSubmit: (query: string) => void;
  title: string;
  notify: (msg: any) => void;
  autoComplete: (query: string) => Promise<Array<string>>;
}


export interface State {
  query: string;
  completes: Array<string>;
}


class NavBar extends React.Component<Props, State> {
  state: State = { query: "", completes: [] };


  private submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const q = this.state.query.trim();
    if (q.length > 1)
      this.props.onSubmit(q);
  };


  private update = async (ev: React.FormEvent<HTMLInputElement>) => {
    const target = ev.target as HTMLInputElement;
    const query = target.value;
    this.setState({ query });

    // TODO buffer the queries with a timeout
    if (query.trim().length < 1) return;
    try {
      const completes = await this.props.autoComplete(query);
      this.setState({ completes });
    } catch (err) {
      this.setState({ completes: [] });
      this.props.notify(err);
    }
  };


  render() {
    return <nav>
      <div>{this.props.title}</div>
      <form className="search-bar" onSubmit={this.submit}>
        <input list="completes" type="search" placeholder="search..."
          value={this.state.query} onChange={this.update} />
        <datalist id="completes">
          {this.state.completes.map(str => <option key={str} value={str}/>)}
        </datalist>
        <input type="submit" className="button" value="search"/>
      </form>
    </nav>;
  }
}


export default NavBar;
